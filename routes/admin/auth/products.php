<?php

use App\Models\PlanVersion;
use App\Models\Product;
use Illuminate\Support\Facades\Route;

Route::middleware('can:admin.products.manage')
    ->prefix('products')
    ->name('products.')
    ->group(function () {
        Route::view('/', 'admin.products.index')
            ->name('index');

        Route::get('/{product}/plans', function (Product $product) {
            return view('admin.plans.index', [
                'product' => $product,
            ]);
        })->name('plans.index');

        Route::get('/{product}/plans/{planVersion}/edit', function (Product $product, PlanVersion $planVersion) {
            abort_unless((int) $planVersion->product_id === (int) $product->id, 404);

            return view('admin.plans.edit', [
                'product' => $product,
                'planVersion' => $planVersion,
            ]);
        })->name('plans.edit');
    });
