<?php

use Illuminate\Support\Facades\Route;

Route::view('/audit', 'admin.audit.index')
    ->name('audit.index');
