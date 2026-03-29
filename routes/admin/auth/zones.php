<?php

use Illuminate\Support\Facades\Route;

Route::middleware('can:admin.countries.manage')
	->prefix('zones')
	->name('zones.')
	->group(function () {
		Route::view('/', 'admin.zones.index')->name('index');
	});
