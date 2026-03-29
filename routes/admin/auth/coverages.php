<?php

use Illuminate\Support\Facades\Route;

Route::middleware(['can:admin.coverages.manage'])
    ->prefix('coverages')
    ->name('coverages.')
    ->group(function () {
        Route::view('/', 'admin.coverages.index')->name('index');
    });
