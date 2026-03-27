<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuditController;

Route::get('/audit', [AuditController::class, 'index'])
    ->name('audit.index');

Route::get('/audit/api/events', [AuditController::class, 'events'])
    ->name('audit.events');
