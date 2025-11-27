<?php

namespace App\Http\Controllers\Api\User\Notification;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = UserNotification::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'status_code' => 200,
            'message'     => 'Danh sách thông báo',
            'data'        => $notifications,
        ]);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();

        UserNotification::where('user_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'status_code' => 200,
            'message'     => 'Đã đánh dấu tất cả đã đọc',
        ]);
    }
}
