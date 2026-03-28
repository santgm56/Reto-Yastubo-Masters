<?php

use App\Http\Controllers\Admin\CompanyController;
use Illuminate\Support\Facades\Route;

// Prefijo /admin y middleware de autenticación/realm vienen del grupo padre en routes/admin.php
Route::prefix('companies')
		->name('companies.')
		->controller(CompanyController::class)
		->group(function ()
		{
			// Listado + JSON para Vue
			Route::get('/', 'index')->name('index');

			Route::prefix('{company}')
					->group(function ()
					{

						Route::get('/edit', 'edit')->name('edit');

						Route::get('/capitados', 'capitatedProducts')->name('capitated-products.index');
					});
		});
