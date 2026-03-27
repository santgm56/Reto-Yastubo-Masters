param(
    [string]$ProjectPath = "D:\SantiiPC\Downloads\craft_html_v1.1.6\frontend-yastubo",
    [string]$DumpPath = "D:\SantiiPC\Downloads\craft_html_v1.1.6\gfa-2025-02-26 (1).sql",
    [string]$DbName = "gfa",
    [string]$DbUser = "gfa",
    [object]$DbSecret = (ConvertTo-SecureString "gfa" -AsPlainText -Force),
    [string]$DbHost = "localhost",
    [int]$DbPort = 3306,
    [string]$RootUser = "root",
    [object]$RootSecret = $null,
    [switch]$SkipCreateUser
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK]   $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Assert-Path {
    param([string]$PathToCheck, [string]$Label)

    if (-not (Test-Path -LiteralPath $PathToCheck)) {
        throw "$Label no existe: $PathToCheck"
    }
}

function Assert-SafeIdentifier {
    param([string]$Value, [string]$Label)

    if (-not ($Value -match '^[A-Za-z0-9_]+$')) {
        throw "$Label invalido. Usa solo letras, numeros o guion bajo. Valor recibido: $Value"
    }
}

function Invoke-MySql {
    param(
        [string]$Executable,
        [string[]]$MySqlArgs,
        [string]$Sql
    )

    $printableArgs = $MySqlArgs | ForEach-Object {
        if ($_ -like '--password=*') {
            return '--password=***'
        }
        return $_
    }

    Write-Host "[DEBUG] mysql $($printableArgs -join ' ')" -ForegroundColor DarkGray
    & $Executable @MySqlArgs -e $Sql
    if ($LASTEXITCODE -ne 0) {
        throw "mysql devolvio codigo $LASTEXITCODE ejecutando SQL."
    }
}

function Convert-SecureStringToPlain {
    param([SecureString]$Secret)

    if (-not $Secret) {
        return ""
    }

    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secret)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
    }
}

function Normalize-Secret {
    param([object]$SecretValue)

    if ($null -eq $SecretValue) {
        return $null
    }

    if ($SecretValue -is [SecureString]) {
        return $SecretValue
    }

    if ($SecretValue -is [string]) {
        if ([string]::IsNullOrWhiteSpace($SecretValue)) {
            return $null
        }

        return ConvertTo-SecureString $SecretValue -AsPlainText -Force
    }

    throw "Formato de secreto no soportado: $($SecretValue.GetType().FullName)"
}

Write-Step "Validando prerequisitos"
Assert-Path -PathToCheck $ProjectPath -Label "ProjectPath"
Assert-Path -PathToCheck $DumpPath -Label "DumpPath"
Assert-SafeIdentifier -Value $DbName -Label "DbName"
Assert-SafeIdentifier -Value $DbUser -Label "DbUser"

$envPath = Join-Path $ProjectPath ".env"
Assert-Path -PathToCheck $envPath -Label ".env"

$mysqlCmd = Get-Command mysql -ErrorAction SilentlyContinue
if (-not $mysqlCmd) {
    throw "No se encontro el cliente 'mysql' en PATH. Instala MySQL Client o agrega su bin al PATH."
}

$listening = Get-NetTCPConnection -LocalPort $DbPort -State Listen -ErrorAction SilentlyContinue
if (-not $listening) {
    throw "No hay servicio escuchando en puerto $DbPort. Inicia MySQL y reintenta."
}
Write-Ok "Cliente mysql y puerto $DbPort disponibles"

$mysqlCommonArgs = @('--no-defaults', '--protocol=TCP', "--host=$DbHost", "--port=$DbPort", "--user=$RootUser")
$rootSecretNormalized = Normalize-Secret -SecretValue $RootSecret
$rootPasswordPlain = Convert-SecureStringToPlain -Secret $rootSecretNormalized
if ($rootPasswordPlain) {
    $mysqlCommonArgs += "--password=$rootPasswordPlain"
}

$dbSecretNormalized = Normalize-Secret -SecretValue $DbSecret
$dbPasswordPlain = Convert-SecureStringToPlain -Secret $dbSecretNormalized

Write-Step "Creando base de datos '$DbName'"
Invoke-MySql -Executable $mysqlCmd.Source -MySqlArgs $mysqlCommonArgs -Sql "CREATE DATABASE IF NOT EXISTS $DbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
Write-Ok "Base de datos validada"

if (-not $SkipCreateUser) {
    Write-Step "Creando usuario '$DbUser' y permisos"
    Invoke-MySql -Executable $mysqlCmd.Source -MySqlArgs $mysqlCommonArgs -Sql "CREATE USER IF NOT EXISTS '$DbUser'@'localhost' IDENTIFIED BY '$dbPasswordPlain'; ALTER USER '$DbUser'@'localhost' IDENTIFIED BY '$dbPasswordPlain'; GRANT ALL PRIVILEGES ON $DbName.* TO '$DbUser'@'localhost'; FLUSH PRIVILEGES;"
    Write-Ok "Usuario/permisos aplicados"
}
else {
    Write-Warn "Omitiendo creacion de usuario por parametro -SkipCreateUser"
}

Write-Step "Importando dump: $DumpPath"
$importArgs = @('--no-defaults', '--protocol=TCP', "--host=$DbHost", "--port=$DbPort", "--user=$DbUser", "--password=$dbPasswordPlain", $DbName)
$printableImportArgs = $importArgs | ForEach-Object {
    if ($_ -like '--password=*') {
        return '--password=***'
    }
    return $_
}
Write-Host "[DEBUG] mysql $($printableImportArgs -join ' ') < dump.sql" -ForegroundColor DarkGray
Get-Content -LiteralPath $DumpPath | & $mysqlCmd.Source @importArgs
if ($LASTEXITCODE -ne 0) {
    throw "Fallo importando dump con mysql (codigo $LASTEXITCODE)."
}
Write-Ok "Dump importado"

Write-Step "Alineando .env con valores locales"
(Get-Content -LiteralPath $envPath) |
    ForEach-Object {
        $_ -replace '^DB_CONNECTION=.*$', 'DB_CONNECTION=mysql' `
           -replace '^DB_HOST=.*$', "DB_HOST=$DbHost" `
           -replace '^DB_PORT=.*$', "DB_PORT=$DbPort" `
           -replace '^DB_DATABASE=.*$', "DB_DATABASE=$DbName" `
           -replace '^DB_USERNAME=.*$', "DB_USERNAME=$DbUser" `
           -replace '^DB_PASSWORD=.*$', "DB_PASSWORD=$dbPasswordPlain"
    } | Set-Content -LiteralPath $envPath -Encoding UTF8
Write-Ok ".env actualizado"

Push-Location $ProjectPath
try {
    Write-Step "Limpiando cache de configuracion"
    php artisan optimize:clear
    if ($LASTEXITCODE -ne 0) {
        throw "php artisan optimize:clear fallo con codigo $LASTEXITCODE"
    }

    Write-Step "Validando conexion con migrate:status"
    php artisan migrate:status
    if ($LASTEXITCODE -ne 0) {
        throw "php artisan migrate:status fallo con codigo $LASTEXITCODE"
    }

    Write-Ok "Integracion local lista. Ya puedes salir de preview-shell cuando auth/seed de usuario este disponible."
}
finally {
    Pop-Location
}
