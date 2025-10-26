<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\Profile\ProfileController;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
| Các API cho admin, có middleware auth:admin để bảo mật
|--------------------------------------------------------------------------
*/

Route::middleware('auth:admin')->prefix('admin')->group(function () {
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'getProfile']);
        Route::post('/', [ProfileController::class, 'updateProfile']);
        Route::put('/change-password', [ProfileController::class, 'changePassword']);
    });
});
