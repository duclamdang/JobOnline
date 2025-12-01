<?php

namespace App\Http\Services\Admin\Profile;

use App\Models\Admin;
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

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

        $avatarFile = $data['avatar'] ?? null;
        $avatarUrl  = $admin->avatar;
        $publicId   = $admin->avatar_public_id;

        if (!empty($avatarFile) && is_object($avatarFile)) {
            try {
                $config = new Configuration([
                    'cloud' => [
                        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                        'api_key'    => env('CLOUDINARY_API_KEY'),
                        'api_secret' => env('CLOUDINARY_API_SECRET'),
                    ],
                ]);

                $cloudinary = new Cloudinary($config);

                $uploaded = $cloudinary->uploadApi()->upload(
                    $avatarFile->getRealPath(),
                    [
                        'folder'        => 'admins/images',
                        'resource_type' => 'image',
                    ]
                );

                $avatarUrl = $uploaded['secure_url'];
                $publicId  = $uploaded['public_id'];

                if (!empty($admin->avatar_public_id)) {
                    $cloudinary->uploadApi()->destroy(
                        $admin->avatar_public_id,
                        ['resource_type' => 'image']
                    );
                }
            } catch (\Exception $e) {
                Log::error('Cloudinary upload admin avatar error: ' . $e->getMessage());

                return [
                    'success' => false,
                    'message' => 'Lỗi upload ảnh đại diện, vui lòng thử lại sau',
                ];
            }
        }

        $admin->update([
            'name'             => $data['name']    ?? $admin->name,
            'phone'            => $data['phone']   ?? $admin->phone,
            'address'          => $data['address'] ?? $admin->address,
            'avatar'           => $avatarUrl,
            'avatar_public_id' => $publicId,
        ]);

        return [
            'success' => true,
            'message' => "Cập nhật hồ sơ thông tin user thành công",
            'admin'   => $admin->fresh(),
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
