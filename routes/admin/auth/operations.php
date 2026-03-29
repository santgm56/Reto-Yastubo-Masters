<?php

use Illuminate\Support\Facades\Route;

Route::view('/issuance/new', 'admin.operations.issuance')
    ->name('issuance.new');

Route::view('/payments', 'admin.operations.payments')
    ->name('payments.index');

Route::view('/cancellations', 'admin.operations.cancellations')
    ->name('cancellations.index');
