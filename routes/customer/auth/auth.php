<?php

use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\LocaleController;
use App\Support\WebLogoutResponder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::match(['get', 'post'], '/logout', function (Request $request) {
	return WebLogoutResponder::toLogin($request, 'customer.login');
})->name('logout');

Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

Route::get('/', fn() => redirect()->route('customer.dashboard'))->name('root');
Route::get('/panel', fn() => redirect()->route('customer.dashboard'))->name('panel');
Route::get('/home', fn() => redirect()->route('customer.dashboard'))->name('home');

Route::get('/dashboard', fn() => view('customer.home', ['section' => 'dashboard']))->name('dashboard');
Route::get('/productos', fn() => view('customer.home', ['section' => 'productos']))->name('products');
Route::get('/transacciones', fn() => view('customer.home', ['section' => 'transacciones']))->name('transactions');
Route::get('/pagos-pendientes', fn() => view('customer.home', ['section' => 'pagos-pendientes']))->name('payments.pending');
Route::get('/metodo-pago', fn() => view('customer.home', ['section' => 'metodo-pago']))->name('payment-method');

// Compatibilidad temporal con FE-001 (placeholders antiguos).
Route::get('/resumen', fn() => redirect()->route('customer.dashboard'));
Route::get('/beneficiarios', fn() => redirect()->route('customer.products'));
Route::get('/suscripciones', fn() => redirect()->route('customer.payments.pending'));
Route::get('/referidos', fn() => redirect()->route('customer.transactions'));

Route::get('/password/force',  [PasswordController::class, 'forceEdit'])->name('password.force.edit');
Route::post('/password/force', [PasswordController::class, 'forceUpdate'])->name('password.force.update');
