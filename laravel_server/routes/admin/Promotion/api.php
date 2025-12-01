<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\Promotion\PromotionController;

Route::prefix('admin')->middleware('auth:admin')->group(function () {
    Route::get('promotions',        [PromotionController::class, 'index']);
    Route::post('promotions',       [PromotionController::class, 'store']);
    Route::get('promotions/{id}',   [PromotionController::class, 'show']);
    Route::put('promotions/{id}',   [PromotionController::class, 'update']);
    Route::delete('promotions/{id}',[PromotionController::class, 'destroy']);
    Route::get('employer/promotions', [PromotionController::class, 'available']);
});
