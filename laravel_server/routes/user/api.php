<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\User\UserController;

Route::prefix('user')->group(function () {
    Route::get('/hello', [UserController::class, 'hello']);
});
