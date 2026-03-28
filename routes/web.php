<?php
// routes/web.php
use Illuminate\Support\Facades\Route;

Route::view('/', 'public.home')->name('home');

foreach (glob(__DIR__.'/public/*.php') as $filename)
{
	require_once $filename;
}




// ===== admin (/admin) =====
Route::middleware('admin')
->prefix('admin')
->name('admin.')
->group(function ()
{
	foreach (glob(__DIR__.'/admin/auth/*.php') as $filename)
	{
		require_once $filename;
	}
});


Route::middleware(['fastapi.token.realm.auth', 'guest:admin'])
->prefix('admin')
->name('admin.')
->group(function () {
	foreach (glob(__DIR__.'/admin/public/*.php') as $filename)
	{
		require_once $filename;
	}
});

// ===== Customer (/) =====
// Autenticados (portal cliente)
Route::middleware('customer')
->prefix('customer')
->name('customer.')
->group(function ()
{
	foreach (glob(__DIR__.'/customer/auth/*.php') as $filename)
	{
		require_once $filename;
	}
});

// ===== Seller (/seller) =====
Route::middleware('seller')
->prefix('seller')
->name('seller.')
->group(function ()
{
	foreach (glob(__DIR__.'/seller/auth/*.php') as $filename)
	{
		require_once $filename;
	}
});

Route::middleware(['fastapi.token.realm.auth', 'guest:seller'])
->prefix('seller')
->name('seller.')
->group(function () {
	foreach (glob(__DIR__.'/seller/public/*.php') as $filename)
	{
		require_once $filename;
	}
});

// Invitados (login/registro) — incluye 'web' para $errors
Route::middleware(['fastapi.token.realm.auth', 'guest:customer'])
->prefix('customer')
->name('customer.')
->group(function () {
	foreach (glob(__DIR__.'/customer/public/*.php') as $filename)
	{
		require_once $filename;
	}
});

// Fallback genérico
Route::fallback(fn() => abort(404));

