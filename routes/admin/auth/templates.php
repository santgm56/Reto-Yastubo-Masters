<?php
// /routes/admin/auth/templates.php

use App\Models\Template;
use App\Support\Breadcrumbs;
use Illuminate\Support\Facades\Route;

Route::middleware('can:admin.templates.edit')
	->prefix('templates')
	->name('templates.')
	->group(function () {

		Route::get('/', function () {
			Breadcrumbs::add('Plantillas', route('admin.templates.index'));

			return view('admin.templates.index');
		})
			->name('index');

		Route::get('/{template}/edit', function (Template $template) {
			Breadcrumbs::add('Plantillas', route('admin.templates.index'));
			Breadcrumbs::add($template->name, route('admin.templates.edit', ['template' => $template->id]));

			return view('admin.templates.edit', [
				'template' => $template,
			]);
		})
			->name('edit');
	});
