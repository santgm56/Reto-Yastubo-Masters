<?php
// routes/admin/auth/regalias.php
// Este archivo está con prefijo /admin para las rutas,
// prefijo .admin para los nombres, middleware de autenticación/realm heredado.

use Illuminate\Support\Facades\Route;

// -------------------------
// Vista principal Regalías
// -------------------------

Route::view('/regalias', 'admin.regalias.index')
    ->name('regalias.index')
    ->middleware('can:regalia.users.read');
