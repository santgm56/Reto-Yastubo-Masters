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

function Invoke-FrontendSetup {
    param(
        [string]$ProjectPath,
        [string]$AdminEmail,
        [string]$AdminPassword,
        [string]$CustomerEmail,
        [string]$CustomerPassword
    )

    Write-Step "Preparando frontend Laravel (migraciones + permisos regalias)"

    Push-Location $ProjectPath
    try {
        php artisan migrate --force
        if ($LASTEXITCODE -ne 0) {
            throw "Fallo migrate --force con codigo $LASTEXITCODE"
        }

        @"
<?php
require 'vendor/autoload.php';

`$app = require 'bootstrap/app.php';
`$kernel = `$app->make(Illuminate\Contracts\Console\Kernel::class);
`$kernel->bootstrap();

`$adminEmail = getenv('E2E_ADMIN_EMAIL');
`$adminPassword = getenv('E2E_ADMIN_PASSWORD');
`$email = getenv('E2E_CUSTOMER_EMAIL');
`$password = getenv('E2E_CUSTOMER_PASSWORD');

if (!`$adminEmail || !`$adminPassword || !`$email || !`$password) {
    fwrite(STDERR, 'Missing E2E admin/customer credentials env vars');
    exit(1);
}

`$permissions = [
    'regalia.users.read',
    'regalia.users.edit',
    'admin.config.create',
    'admin.config.read',
    'admin.config.fill',
    'admin.config.edit',
    'admin.config.delete',
    'admin.countries.manage',
    'admin.coverages.manage',
    'admin.products.manage',
    'users.viewAny',
    'unit.structure.manage',
    'system.roles',
    'admin.templates.edit',
    'unit.structure.view',
];

foreach (`$permissions as `$permissionName) {
    Spatie\Permission\Models\Permission::firstOrCreate([
        'name' => `$permissionName,
        'guard_name' => 'admin',
    ]);
}

`$admin = App\Models\User::withTrashed()->firstOrNew(['email' => `$adminEmail]);
`$admin->realm = 'admin';
`$admin->first_name = `$admin->first_name ?: 'Admin';
`$admin->last_name = `$admin->last_name ?: 'E2E';
`$admin->display_name = 'Admin E2E';
`$admin->status = 'active';
`$admin->locale = `$admin->locale ?: 'es';
`$admin->timezone = `$admin->timezone ?: 'America/Santiago';
`$admin->deleted_at = null;
`$admin->force_password_change = false;
`$admin->save();
`$admin->syncPermissions(`$permissions);
`$admin->password = `$adminPassword;
`$admin->save();

`$user = App\Models\User::withTrashed()->firstOrNew(['email' => `$email]);
`$user->realm = 'customer';
`$user->first_name = `$user->first_name ?: 'Cliente';
`$user->last_name = `$user->last_name ?: 'E2E';
`$user->display_name = 'Cliente E2E';
`$user->status = 'active';
`$user->locale = `$user->locale ?: 'es';
`$user->timezone = `$user->timezone ?: 'America/Santiago';
`$user->deleted_at = null;
`$user->password = `$password;
`$user->force_password_change = false;
`$user->save();

app()[Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

echo 'admin-customer-e2e-ready';
"@ | php | Out-Null

    Write-Ok "Frontend Laravel preparado para smoke admin/customer"
    }
    finally {
        Pop-Location
    }
}

function Test-Port8001 {
    $result = Test-NetConnection -ComputerName 127.0.0.1 -Port 8001 -WarningAction SilentlyContinue
    return [bool]$result.TcpTestSucceeded
}

function Test-Port5173 {
    $result = Test-NetConnection -ComputerName 127.0.0.1 -Port 5173 -WarningAction SilentlyContinue
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
$customerEmail = $null
$customerSecret = $null

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

if ([string]::IsNullOrWhiteSpace($customerEmail)) {
    $customerEmail = $env:SMOKE_CUSTOMER_EMAIL
}

if ([string]::IsNullOrWhiteSpace($customerSecret)) {
    $customerSecret = $env:SMOKE_CUSTOMER_PASSWORD
}

if ([string]::IsNullOrWhiteSpace($customerEmail)) {
    $customerEmail = 'customer.e2e@gfa.com'
}

if ([string]::IsNullOrWhiteSpace($customerSecret)) {
    $customerSecret = 'GfaCustomer2026A'
}

if ([string]::IsNullOrWhiteSpace($adminEmail) -or [string]::IsNullOrWhiteSpace($adminSecret)) {
    $adminEmail = 'admin.e2e@gfa.com'
    $adminSecret = 'GfaAdmin2026A'
}

$backendStartedByScript = $false
$backendProcess = $null
$viteStartedByScript = $false
$viteProcess = $null

try {
    Write-Step "Verificando backend FastAPI en 127.0.0.1:8001"

    $env:E2E_CUSTOMER_EMAIL = $customerEmail
    $env:E2E_CUSTOMER_PASSWORD = $customerSecret
    $env:E2E_ADMIN_EMAIL = $adminEmail
    $env:E2E_ADMIN_PASSWORD = $adminSecret

    Invoke-FrontendSetup -ProjectPath $FrontendPath -AdminEmail $adminEmail -AdminPassword $adminSecret -CustomerEmail $customerEmail -CustomerPassword $customerSecret

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

    Write-Step "Verificando frontend Vite en 127.0.0.1:5173"

    if (-not (Test-Port5173)) {
        Write-Step "Vite no disponible, iniciando frontend dev server"
        $npmCommand = (Get-Command npm.cmd).Source
        $viteProcess = Start-Process -FilePath $npmCommand -ArgumentList "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173" -WorkingDirectory $FrontendPath -PassThru
        $viteStartedByScript = $true

        $maxAttempts = 30
        $attempt = 0
        while ($attempt -lt $maxAttempts -and -not (Test-Port5173)) {
            Start-Sleep -Seconds 1
            $attempt++
        }

        if (-not (Test-Port5173)) {
            throw "No fue posible levantar Vite en 127.0.0.1:5173 dentro del timeout."
        }

        Write-Ok "Vite arriba en 127.0.0.1:5173"
    }
    else {
        Write-Ok "Vite ya estaba corriendo en 127.0.0.1:5173"
    }

    Write-Step "Ejecutando Playwright release:v2:evidence"
    Set-Location $FrontendPath

    $env:E2E_BASE_URL = 'http://127.0.0.1:8001'
    $env:SMOKE_ADMIN_EMAIL = $adminEmail
    $env:SMOKE_ADMIN_PASSWORD = $adminSecret
    $env:SMOKE_CUSTOMER_EMAIL = $customerEmail
    $env:SMOKE_CUSTOMER_PASSWORD = $customerSecret

    npm run test:e2e:release:v2:evidence

    if ($LASTEXITCODE -ne 0) {
        throw "La suite E2E finalizo con codigo $LASTEXITCODE"
    }

    Write-Ok "Suite release:v2:evidence finalizada en verde"
}
finally {
    if ($viteStartedByScript -and $viteProcess -and -not $KeepBackendRunning) {
        Write-Step "Deteniendo frontend Vite levantado por el script"
        try {
            Stop-Process -Id $viteProcess.Id -Force -ErrorAction Stop
            Write-Ok "Frontend Vite detenido"
        }
        catch {
            Write-Warn "No se pudo detener automaticamente Vite (PID $($viteProcess.Id))."
        }
    }

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
