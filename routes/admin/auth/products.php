<?php

use Illuminate\Support\Facades\Route;

Route::middleware('can:admin.products.manage')
    ->prefix('products')
    ->name('products.')
    ->group(function () {
        Route::view('/', 'admin.products.index')
            ->name('index');

        Route::view('/{product}/plans', 'admin.plans.index')
            ->whereNumber('product')
            ->name('plans.index');

        Route::view('/{product}/plans/{planVersion}/edit', 'admin.plans.edit')
            ->whereNumber('product')
            ->whereNumber('planVersion')
            ->name('plans.edit');
    });
