<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Constants\HttpStatus;
use App\Http\Controllers\Api\Admin\Auth\AuthController;

/*
|--------------------------------------------------------------------------
| Admin Auth Routes
|--------------------------------------------------------------------------
| Xử lý đăng ký, đăng nhập, logout, refresh token,
| quên mật khẩu và reset mật khẩu cho admin.
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->group(function () {
    // Auth
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:admin');
    Route::post('/refresh', [AuthController::class, 'refreshToken']);

    // Forgot & Reset Password
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

    Route::get('/reset-password/{token}', function (Request $request, $token) {
        return response()->json([
            'status_code' => HttpStatus::OK,
            'message'     => 'Đây là trang reset password giả lập cho API.',
            'data'        => [
                'token' => $token,
                'email' => $request->query('email'),
            ],
        ], HttpStatus::OK);
    })->name('admin.password.reset');

    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});
