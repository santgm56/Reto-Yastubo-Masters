<?php

use Illuminate\Support\Facades\Route;

Route::prefix('config')
    ->name('config.')
    ->group(function () {
        Route::view('/', 'admin.config.index')
            ->middleware('can:admin.config.read')
            ->name('index');
    });
