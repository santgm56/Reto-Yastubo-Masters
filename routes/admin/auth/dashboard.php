<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'admin.dashboard', [
	'title' => __('Dashboard'),
])->name('home');
