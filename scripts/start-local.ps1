param(
    [string]$ProjectPath = "D:\SantiiPC\Downloads\craft_html_v1.1.6\frontend-yastubo"
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

if (-not (Test-Path -LiteralPath $ProjectPath)) {
    throw "ProjectPath no existe: $ProjectPath"
}

Set-Location $ProjectPath

Write-Step "Validando prerequisitos de runtime"
if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    throw "No se encontro php en PATH."
}

if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
    throw "No se encontro composer en PATH."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "No se encontro npm en PATH."
}

$mysqlListening = Get-NetTCPConnection -LocalPort 3306 -State Listen -ErrorAction SilentlyContinue
if (-not $mysqlListening) {
    throw "MySQL no esta escuchando en puerto 3306. Inicia MySQL antes de ejecutar este script."
}
Write-Ok "Prerequisitos validados"

Write-Step "Limpiando caches de Laravel"
php artisan optimize:clear
if ($LASTEXITCODE -ne 0) {
    throw "php artisan optimize:clear fallo con codigo $LASTEXITCODE"
}

Write-Step "Validando conexion a BD"
php artisan migrate:status
if ($LASTEXITCODE -ne 0) {
    throw "php artisan migrate:status fallo con codigo $LASTEXITCODE"
}
Write-Ok "Conexion a BD OK"

Write-Step "Iniciando entorno dev (server + queue + logs + vite)"
Write-Host "Usa Ctrl+C para detener todo." -ForegroundColor Yellow
composer run dev
