<?php

use Illuminate\Support\Facades\Route;

Route::middleware('can:admin.countries.manage')
	->prefix('countries')
    ->name('countries.')
	->group(function () {
    Route::view('/', 'admin.countries.index')->name('index');
});
