<?php

use App\Http\Controllers\Api\Admin\Employer\EmployerController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:admin')->prefix('admin')->group(function () {
    Route::prefix('employers')->group(function () {
        Route::middleware('check.root.role')->group(function () {
            Route::get('/', [EmployerController::class, 'getAll']);
            Route::get('/{id}', [EmployerController::class, 'getById']);
            Route::put('/{id}/active', [EmployerController::class, 'active']);
        });
    });
});
