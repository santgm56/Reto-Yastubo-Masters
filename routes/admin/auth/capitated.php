<?php
// routes/admin/auth/capitated.php

use App\Http\Controllers\Admin\CapitatedBatchController;
use App\Http\Controllers\Admin\CapitatedPersonController;
use Illuminate\Support\Facades\Route;

// Prefijo /admin, middleware 'admin' y nombre base 'admin.' vienen del grupo padre en routes/web.php

Route::prefix('companies/{company}/capitados')
    ->name('companies.capitated.')
    ->group(function () {
        // Personas (fichas asegurado por producto)
        Route::get('/persons', [CapitatedPersonController::class, 'index'])
            ->name('persons.index');
        Route::get('/persons/{person}', [CapitatedPersonController::class, 'show'])
            ->name('persons.show');

        // Detalle de batch (JSON para la vista de detalle)
        Route::get('/batches/{batch}', [CapitatedBatchController::class, 'show'])
            ->name('batches.show');

    });
