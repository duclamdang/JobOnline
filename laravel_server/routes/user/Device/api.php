<?php

use App\Http\Controllers\Api\User\Device\DeviceController;
use Illuminate\Support\Facades\Route;

Route::prefix('user')
    ->middleware('auth:user')
    ->group(function () {
        Route::post('/device/register', [DeviceController::class, 'register']);
    });
