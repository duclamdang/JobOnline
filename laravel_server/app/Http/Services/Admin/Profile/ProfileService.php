<?php

namespace App\Http\Services\Admin\Profile;

use App\Models\Admin;
use Illuminate\Support\Facades\Hash;

class ProfileService
{
    public function getProfile(Admin $admin): array
    {
        return [
            'success' => true,
            'message' => 'Lấy thông tin user thành công',
            'admin'   => $admin,
        ];
    }

    public function updateProfile(Admin $admin, array $data): array
    {
        if (!$admin) {
            return [
                'success' => false,
                'message' => "Người dùng không tồn tại",
            ];
        }

        if (!empty($data['avatar']) && is_object($data['avatar'])) {
            $originalName = pathinfo($data['avatar']->getClientOriginalName(), PATHINFO_FILENAME);
            $extension    = $data['avatar']->getClientOriginalExtension();
            $uniqueId     = uniqid();
            $filename     = $originalName . '_' . $uniqueId . '.' . $extension;

            $avatarPath = $data['avatar']->storeAs('admins/images', $filename, 'public');
        } else {
            $avatarPath = $admin->avatar;
        }

        $admin->update([
            'name'    => $data['name']    ?? $admin->name,
            'phone'   => $data['phone']   ?? $admin->phone,
            'address' => $data['address'] ?? $admin->address,
            'avatar'  => $avatarPath,
        ]);

        return [
            'success' => true,
            'message' => "Cập nhật hồ sơ thông tin user thành công",
            'admin'   => $admin,
        ];
    }


    public function changePassword(Admin $admin, string $currentPassword, string $newPassword): array
    {
        if (!Hash::check($currentPassword, $admin->password)) {
            return [
                'success' => false,
                'message' => 'Mật khẩu hiện tại không chính xác',
            ];
        }

        $admin->update([
            'password' => Hash::make($newPassword),
        ]);

        return [
            'success' => true,
            'message' => 'Đổi mật khẩu thành công',
        ];
    }
}
