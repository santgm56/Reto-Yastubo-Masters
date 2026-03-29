<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\PasswordController;
use App\Support\WebLogoutResponder;
use Illuminate\Http\Request;

Route::match(['get', 'post'], '/logout', function (Request $request) {
	return WebLogoutResponder::toLogin($request, 'seller.login');
})->name('logout');

Route::get('/password/force', [PasswordController::class, 'forceEdit'])->name('password.force.edit');
Route::post('/password/force', [PasswordController::class, 'forceUpdate'])->name('password.force.update');

Route::get('/', fn () => view('seller.home', [
	'section' => 'dashboard',
	'title' => 'Seller Dashboard',
]))->name('home');

Route::get('/dashboard', fn () => view('seller.home', [
	'section' => 'dashboard',
	'title' => 'Seller Dashboard',
]))->name('dashboard');

Route::get('/customers', fn () => view('seller.home', [
	'section' => 'customers',
	'title' => 'Seller Customers',
]))->name('customers');

Route::get('/sales', fn () => view('seller.home', [
	'section' => 'sales',
	'title' => 'Seller Sales',
]))->name('sales');

Route::get('/issuance/new', fn () => view('seller.issuance'))->name('issuance.new');
Route::get('/payments', fn () => view('seller.payments'))->name('payments.index');
