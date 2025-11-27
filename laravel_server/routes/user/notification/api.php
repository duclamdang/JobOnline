<?php

use App\Http\Controllers\Api\User\Notification\NotificationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:user')->prefix('user')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
});
