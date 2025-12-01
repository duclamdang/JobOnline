<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\Promotion\PromotionController;

Route::prefix('admin')->middleware('auth:admin')->group(function () {
    // Root admin manage khuyến mãi
    Route::get('promotions',        [PromotionController::class, 'index']);
    Route::post('promotions',       [PromotionController::class, 'store']);
    Route::get('promotions/{id}',   [PromotionController::class, 'show']);
    Route::put('promotions/{id}',   [PromotionController::class, 'update']);
    Route::delete('promotions/{id}',[PromotionController::class, 'destroy']);

    // Employer xem danh sách khuyến mãi đang áp dụng
    Route::get('employer/promotions', [PromotionController::class, 'available']);
});
