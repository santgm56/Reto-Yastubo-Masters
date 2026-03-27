<?php

use App\Http\Controllers\Admin\OperationsController;
use Illuminate\Support\Facades\Route;

Route::get('/issuance/new', [OperationsController::class, 'issuance'])
    ->name('issuance.new');

Route::get('/payments', [OperationsController::class, 'payments'])
    ->name('payments.index');

Route::get('/cancellations', [OperationsController::class, 'cancellations'])
    ->name('cancellations.index');
