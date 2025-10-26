<?php

use App\Http\Controllers\Api\Admin\User\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:admin')->prefix('admin')->group(function () {
    Route::prefix('users')->group(function () {

        Route::get('/list', [UserController::class, 'getUsers']);
        Route::post('/{user}/buy-contact', [UserController::class, 'buyContact']);
        Route::get('/points', [UserController::class, 'points']);

        Route::middleware('check.root.role')->group(function () {
            Route::get('/', [UserController::class, 'getAll']);
            Route::get('/{id}', [UserController::class, 'getById']);
        });


    });
});
