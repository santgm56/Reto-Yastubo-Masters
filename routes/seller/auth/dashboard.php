<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Seller\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;

Route::match(['get', 'post'], '/logout', function (Request $request) {
	$request->session()->invalidate();
	$request->session()->regenerateToken();

	return redirect()
		->route('seller.login')
		->withCookie(Cookie::forget('yastubo_access_token', '/'));
})->name('logout');

Route::get('/password/force', [PasswordController::class, 'forceEdit'])->name('password.force.edit');
Route::post('/password/force', [PasswordController::class, 'forceUpdate'])->name('password.force.update');

Route::get('/', [DashboardController::class, 'index'])->name('home');
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/customers', [DashboardController::class, 'customers'])->name('customers');
Route::get('/sales', [DashboardController::class, 'sales'])->name('sales');
Route::get('/issuance/new', [DashboardController::class, 'issuance'])->name('issuance.new');
Route::get('/payments', [DashboardController::class, 'payments'])->name('payments.index');
