param(
    [string]$ProjectPath = '',
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Tests
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ProjectPath)) {
    $ProjectPath = Split-Path -Parent $PSScriptRoot
}

function Write-Step {
    param([string]$Message)
    Write-Host "[STEP] $Message" -ForegroundColor Cyan
}

function Write-Ok {
    param([string]$Message)
    Write-Host "[OK]   $Message" -ForegroundColor Green
}

if (-not (Test-Path -LiteralPath $ProjectPath)) {
    throw "ProjectPath no existe: $ProjectPath"
}

$phpCommand = Get-Command php -ErrorAction SilentlyContinue
if (-not $phpCommand) {
    throw "No se encontro php en PATH."
}

$phpExe = $phpCommand.Source
$phpRoot = Split-Path $phpExe
$extensionDir = Join-Path $phpRoot 'ext'
$pdoSqliteDll = Join-Path $extensionDir 'php_pdo_sqlite.dll'
$sqliteDll = Join-Path $extensionDir 'php_sqlite3.dll'
$phpunitPath = Join-Path $ProjectPath 'vendor\phpunit\phpunit\phpunit'

if (-not (Test-Path -LiteralPath $extensionDir)) {
    throw "No se encontro extension_dir en: $extensionDir"
}

if (-not (Test-Path -LiteralPath $pdoSqliteDll)) {
    throw "No se encontro php_pdo_sqlite.dll en: $pdoSqliteDll"
}

if (-not (Test-Path -LiteralPath $sqliteDll)) {
    throw "No se encontro php_sqlite3.dll en: $sqliteDll"
}

if (-not (Test-Path -LiteralPath $phpunitPath)) {
    throw "No se encontro PHPUnit en: $phpunitPath"
}

if (-not $Tests -or $Tests.Count -eq 0) {
    $Tests = @(
        'tests/Feature/FastApiAdminForcePasswordChangeBridgeTest.php',
        'tests/Feature/FastApiAdminSessionBindingBridgeTest.php',
        'tests/Feature/FastApiAdminActiveBridgeTest.php',
        'tests/Feature/FastApiAdminTimeoutBridgeTest.php',
        'tests/Feature/FastApiSellerTimeoutBridgeTest.php',
        'tests/Feature/FastApiCustomerTimeoutBridgeTest.php',
        'tests/Feature/FastApiCustomerActiveBridgeTest.php',
        'tests/Feature/FastApiSellerActiveBridgeTest.php',
        'tests/Feature/FastApiGuestRedirectTest.php',
        'tests/Unit/RealmTest.php'
    )
}

Write-Step "Ejecutando PHPUnit con sqlite3/pdo_sqlite habilitados desde $phpExe"

Push-Location $ProjectPath
try {
    $arguments = @(
        '-d', "extension_dir=$extensionDir",
        '-d', 'extension=sqlite3',
        '-d', 'extension=pdo_sqlite',
        $phpunitPath
    ) + $Tests

    & $phpExe @arguments
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        throw "PHPUnit fallo con codigo $exitCode"
    }

    Write-Ok "Suite completada sin errores"
}
finally {
    Pop-Location
}
