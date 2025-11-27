<?php

use App\Http\Services\Admin\FcmService;
use App\Models\UserDevice;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\User\UserController;

Route::prefix('user')->group(function () {
    Route::get('/hello', [UserController::class, 'hello']);
});


Route::get('/test-push/{userId}', function ($userId, FcmService $fcm) {
    $tokens = UserDevice::where('user_id', $userId)->pluck('device_token')->toArray();

    if (empty($tokens)) {
        return response()->json(['message' => 'Không tìm thấy device token'], 404);
    }

    $fcm->sendToTokens(
        $tokens,
        'Test thông báo',
        'Đây là tin nhắn test từ API v1',
        ['type' => 'test']
    );

    return response()->json(['message' => 'Đã gửi test push']);
});
