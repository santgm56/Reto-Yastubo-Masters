<?php

use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\LocaleController;
use Illuminate\Support\Facades\Route;

Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

Route::get('/', fn() => redirect()->route('customer.home'))->name('dashboard');
Route::get('/panel', fn() => redirect()->route('customer.home'));

Route::get('/resumen', fn() => view('customer.home', ['section' => 'resumen']))->name('customer.home');
Route::get('/beneficiarios', fn() => view('customer.home', ['section' => 'beneficiarios']))->name('beneficiaries');
Route::get('/suscripciones', fn() => view('customer.home', ['section' => 'suscripciones']))->name('subscriptions');
Route::get('/referidos', fn() => view('customer.home', ['section' => 'referidos']))->name('referrals');

Route::get('/password/force',  [PasswordController::class, 'forceEdit'])->name('password.force.edit');
Route::post('/password/force', [PasswordController::class, 'forceUpdate'])->name('password.force.update');