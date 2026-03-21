# Local DB Setup (sin depender de terceros)

Este flujo levanta tu base local para `gfa-emisiones` usando el dump existente.

## 1) Requisitos

- MySQL Server iniciado en `localhost:3306`.
- Cliente `mysql` en `PATH`.
- PHP CLI disponible (`php -v`).
- Dump local: `D:\SantiiPC\Downloads\craft_html_v1.1.6\gfa-2025-02-26 (1).sql`.

## 2) Ejecutar bootstrap

Desde PowerShell:

```powershell
Set-Location "D:\SantiiPC\Downloads\craft_html_v1.1.6\gfa-emisiones"
Set-ExecutionPolicy -Scope Process Bypass
./scripts/bootstrap-local-db.ps1
```

## 3) Si root tiene clave

```powershell
$rootSecret = Read-Host "Root password" -AsSecureString
./scripts/bootstrap-local-db.ps1 -RootUser root -RootSecret $rootSecret
```

## 4) Si ya existe usuario y no quieres recrearlo

```powershell
./scripts/bootstrap-local-db.ps1 -SkipCreateUser
```

## 5) Verificacion final

El script ejecuta:

- `php artisan optimize:clear`
- `php artisan migrate:status`

Si `migrate:status` responde sin error de conexion, la app ya puede trabajar con BD local.

## 6) Arranque diario (todo en un comando)

Cuando ya tengas BD importada y activa:

```powershell
Set-Location "D:\SantiiPC\Downloads\craft_html_v1.1.6\gfa-emisiones"
Set-ExecutionPolicy -Scope Process Bypass
./scripts/start-local.ps1
```

Esto valida:

- runtime (php/composer/npm)
- MySQL en 3306
- `php artisan migrate:status`

Y luego ejecuta `composer run dev`.

## 7) Errores comunes

- `No hay servicio escuchando en puerto 3306`:
  - Inicia MySQL (XAMPP/Laragon/Servicio Windows) y reintenta.
- `No se encontro el cliente mysql`:
  - Agrega el `bin` de MySQL al `PATH` o instala MySQL Client.
- `Access denied`:
  - Reintenta con `-RootPassword` correcto.
