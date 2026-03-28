<?php
// routes/admin/auth/regalias.php
// Este archivo está con prefijo /admin para las rutas,
// prefijo .admin para los nombres, middleware de autenticación/realm heredado.

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\RegaliasController;

// -------------------------
// Vista principal Regalías
// -------------------------

Route::get('/regalias', [RegaliasController::class, 'index'])
    ->name('regalias.index')
    ->middleware('can:regalia.users.read');
