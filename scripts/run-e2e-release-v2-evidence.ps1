param(
    [string]$FrontendPath = "D:\SantiiPC\Downloads\craft_html_v1.1.6\frontend-yastubo",
    [string]$BackendPath = "D:\SantiiPC\Downloads\craft_html_v1.1.6\backend-yastubo",
    [PSCredential]$AdminCredential,
    [switch]$KeepBackendRunning
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

function Test-Port8001 {
    $result = Test-NetConnection -ComputerName 127.0.0.1 -Port 8001 -WarningAction SilentlyContinue
    return [bool]$result.TcpTestSucceeded
}

if (-not (Test-Path -LiteralPath $FrontendPath)) {
    throw "FrontendPath no existe: $FrontendPath"
}

if (-not (Test-Path -LiteralPath $BackendPath)) {
    throw "BackendPath no existe: $BackendPath"
}

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    throw "No se encontro 'py' en PATH. Instala Python Launcher o ajusta el script."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "No se encontro 'npm' en PATH."
}

$adminSecret = $null
$adminEmail = $null

if ($AdminCredential) {
    $adminEmail = $AdminCredential.UserName
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($AdminCredential.Password)
    try {
        $adminSecret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

if ([string]::IsNullOrWhiteSpace($adminEmail)) {
    $adminEmail = $env:SMOKE_ADMIN_EMAIL
}

if ([string]::IsNullOrWhiteSpace($adminSecret)) {
    $adminSecret = $env:SMOKE_ADMIN_PASSWORD
}

if ([string]::IsNullOrWhiteSpace($adminEmail) -or [string]::IsNullOrWhiteSpace($adminSecret)) {
    throw "Debes pasar -AdminCredential (PSCredential) o definir SMOKE_ADMIN_EMAIL/SMOKE_ADMIN_PASSWORD."
}

$backendStartedByScript = $false
$backendProcess = $null

try {
    Write-Step "Verificando backend FastAPI en 127.0.0.1:8001"

    if (-not (Test-Port8001)) {
        Write-Step "Backend no disponible, iniciando FastAPI"
        $backendProcess = Start-Process -FilePath "py" -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8001" -WorkingDirectory $BackendPath -PassThru
        $backendStartedByScript = $true

        $maxAttempts = 30
        $attempt = 0
        while ($attempt -lt $maxAttempts -and -not (Test-Port8001)) {
            Start-Sleep -Seconds 1
            $attempt++
        }

        if (-not (Test-Port8001)) {
            throw "No fue posible levantar FastAPI en 127.0.0.1:8001 dentro del timeout."
        }

        Write-Ok "FastAPI arriba en 127.0.0.1:8001"
    }
    else {
        Write-Ok "FastAPI ya estaba corriendo en 127.0.0.1:8001"
    }

    Write-Step "Ejecutando Playwright release:v2:evidence"
    Set-Location $FrontendPath

    $env:SMOKE_ADMIN_EMAIL = $adminEmail
    $env:SMOKE_ADMIN_PASSWORD = $adminSecret

    npm run test:e2e:release:v2:evidence

    if ($LASTEXITCODE -ne 0) {
        throw "La suite E2E finalizo con codigo $LASTEXITCODE"
    }

    Write-Ok "Suite release:v2:evidence finalizada en verde"
}
finally {
    if ($backendStartedByScript -and $backendProcess -and -not $KeepBackendRunning) {
        Write-Step "Deteniendo backend FastAPI levantado por el script"
        try {
            Stop-Process -Id $backendProcess.Id -Force -ErrorAction Stop
            Write-Ok "Backend detenido"
        }
        catch {
            Write-Warn "No se pudo detener automaticamente el backend (PID $($backendProcess.Id))."
        }
    }
}
