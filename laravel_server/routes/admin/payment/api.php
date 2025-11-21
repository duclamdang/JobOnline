<?php

use App\Http\Controllers\Api\Admin\Payment\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:admin'])->prefix('admin/employer-payment')->group(function () {
    Route::post('/create', [PaymentController::class, 'create']); // admin_client gọi
});

// callback / ipn
Route::get('/payment/vnpay/return', [PaymentController::class, 'vnpayReturn']);
Route::get('/payment/momo/return',  [PaymentController::class, 'momoReturn']);
Route::post('/payment/momo/ipn',    [PaymentController::class, 'momoIpn']);
