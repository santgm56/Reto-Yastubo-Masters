<?php
// /routes/admin/auth/templates.php

use App\Http\Controllers\Admin\TemplateController;
use Illuminate\Support\Facades\Route;

Route::middleware('can:admin.templates.edit')
	->prefix('templates')
	->name('templates.')
	->group(function () {

		Route::get('/', [TemplateController::class, 'index'])
			->name('index');

		Route::get('/{template}/edit', [TemplateController::class, 'edit'])
			->name('edit');
	});
