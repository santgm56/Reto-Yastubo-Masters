<?php

use App\Http\Controllers\Admin\CapitatedContractController;
use App\Http\Controllers\Auth\PasswordController;
use Illuminate\Support\Facades\Route;

Route::view('/login', 'admin.auth.login')->name('login');

Route::get('/forgot-password', [PasswordController::class, 'requestForm'])->name('password.request');
Route::post('/forgot-password', [PasswordController::class, 'emailLink'])->name('password.email');
Route::get('/reset-password/{token}', [PasswordController::class, 'showResetForm'])->name('password.reset');
Route::post('/reset-password', [PasswordController::class, 'reset'])->name('password.update');
