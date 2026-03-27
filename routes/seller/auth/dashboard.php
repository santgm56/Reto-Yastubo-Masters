<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Seller\DashboardController;

Route::get('/logout', [LoginController::class, 'logout'])->name('logout');
Route::post('/logout', [LoginController::class, 'logout']);

Route::get('/password/force', [PasswordController::class, 'forceEdit'])->name('password.force.edit');
Route::post('/password/force', [PasswordController::class, 'forceUpdate'])->name('password.force.update');

Route::get('/', [DashboardController::class, 'index'])->name('home');
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/customers', [DashboardController::class, 'customers'])->name('customers');
Route::get('/sales', [DashboardController::class, 'sales'])->name('sales');
Route::get('/issuance/new', [DashboardController::class, 'issuance'])->name('issuance.new');
Route::get('/payments', [DashboardController::class, 'payments'])->name('payments.index');

Route::get('/api/dashboard-summary', [DashboardController::class, 'summary'])
    ->name('api.dashboard-summary');

Route::get('/api/customers', [DashboardController::class, 'customersData'])
    ->name('api.customers');

Route::get('/api/sales', [DashboardController::class, 'salesData'])
    ->name('api.sales');
