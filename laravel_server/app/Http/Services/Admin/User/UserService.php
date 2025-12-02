<?php

namespace App\Http\Services\Admin\User;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function getAll(int $perPage = 10): array
    {
        $users = User::orderBy('created_at', 'asc')->paginate($perPage);

        return [
            'success'   => true,
            'message'   => 'Lấy danh sách tài khoản thành công',
            'users' => $users,
        ];
    }

    public function getById(int $id): array
    {
        $user = User::where('id', $id)
            ->where('is_active', true)
            ->first();

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy người dùng',
                'data' => null,
            ];
        }

        return [
            'success' => true,
            'data' => $user,
        ];
    }

    public function getUsers()
    {
        return User::where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getPoints($admin)
    {
        return $admin->points;
    }

    public function buyContact($admin, User $user, int $cost = 2)
    {
        if (!$user || !$user->id) {
            return [
                'success' => false,
                'message' => 'User không hợp lệ'
            ];
        }
        if ($admin->points < $cost) {
            return [
                'success' => false,
                'message' => 'Không đủ điểm để mua thông tin liên hệ',
                'remainingPoints' => $admin->points
            ];
        }
        DB::transaction(function () use ($admin, $user, $cost) {
            $admin->points -= $cost;
            $admin->save();

            $admin->purchasedUsers()->syncWithoutDetaching([$user->id]);
        });
        return [
            'success' => true,
            'contact' => [
                'phone' => $user->phone,
                'email' => $user->email,
            ],
            'remainingPoints' => $admin->points
        ];
    }
}
