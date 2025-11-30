<?php

namespace App\Http\Controllers\Api\User\Device;

use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DeviceController extends Controller
{
    public function register(Request $request)
    {
        /** @var \App\Models\User|null $user */
        $user = auth('user')->user();

        if (! $user) {
            Log::warning('Device register: user is null');
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = $request->validate([
            'device_token' => 'required|string',
            'platform'     => 'nullable|string|max:50',
        ]);

        Log::info('Register device', [
            'user_id'      => $user->id,
            'email'        => $user->email,
            'device_token' => $data['device_token'],
            'platform'     => $data['platform'] ?? 'android',
        ]);
        UserDevice::updateOrCreate(
            [
                'device_token' => $data['device_token'],
            ],
            [
                'user_id'  => $user->id,
                'platform' => $data['platform'] ?? 'android',
            ],
        );

        return response()->json([
            'message' => 'Đăng ký thiết bị thành công',
        ]);
    }

}
