<?php

namespace App\Http\Controllers\Api\User\Device;

use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function register(Request $request)
    {
        $user = auth('user')->user();

        $data = $request->validate([
            'device_token' => 'required|string',
            'platform'     => 'nullable|string|max:50',
        ]);

        UserDevice::updateOrCreate(
            [
                'user_id'      => $user->id,
                'device_token' => $data['device_token'],
            ],
            [
                'platform' => $data['platform'] ?? 'android',
            ],
        );

        return response()->json([
            'message' => 'Đăng ký thiết bị thành công',
        ]);
    }
}
