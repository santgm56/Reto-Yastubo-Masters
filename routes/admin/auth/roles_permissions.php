<?php

use Illuminate\Support\Facades\Route;

Route::prefix('acl')
    ->name('acl.')
    ->middleware(['can:system.roles'])
    ->group(function () {
        Route::get('roles/{guard}', function (string $guard) {
            return view('admin.acl.roles', [
                'guard' => $guard,
            ]);
        })
            ->where('guard', 'admin|customer')
            ->name('roles-permissions.index');
    });
