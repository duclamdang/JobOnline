<?php

namespace App\Http\Services\User\Profile;

use App\Models\UserLanguage;
use App\Models\User;

class UserLanguageService
{
    public function getAll(User $user): array
    {
        $languages = UserLanguage::with('language')
            ->where('user_id', $user->id)
            ->get();

        return [
            'success'   => true,
            'message'   => 'Lấy danh sách ngoại ngữ thành công',
            'languages' => $languages,
        ];
    }

    public function getById(User $user, int $id): array
    {
        $language = UserLanguage::with('language')->find($id);

        if (!$language) {
            return [
                'success' => false,
                'message' => "Ngoại ngữ không tồn tại",
            ];
        }

        if ($language->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền truy cập ngoại ngữ này",
            ];
        }

        return [
            'success'  => true,
            'message'  => 'Lấy ngoại ngữ thành công',
            'language' => $language,
        ];
    }

    public function create(User $user, array $data): array
    {
        $data['user_id'] = $user->id;
        $language = UserLanguage::create($data);

        return [
            'success'  => true,
            'message'  => 'Thêm ngoại ngữ thành công',
            'language' => $language,
        ];
    }

    public function update(User $user, int $id, array $data): array
    {
        $language = UserLanguage::with('language')->find($id);

        if (!$language) {
            return [
                'success' => false,
                'message' => "Ngoại ngữ không tồn tại",
            ];
        }

        if ($language->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền cập nhật ngoại ngữ này",
            ];
        }

        $language->update($data);

        return [
            'success'  => true,
            'message'  => 'Cập nhật ngoại ngữ thành công',
            'language' => $language,
        ];
    }

    public function delete(User $user, int $id): array
    {
        $language = UserLanguage::with('language')->find($id);

        if (!$language) {
            return [
                'success' => false,
                'message' => "Ngoại ngữ không tồn tại",
            ];
        }

        if ($language->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền xóa ngoại ngữ này",
            ];
        }

        $language->delete();

        return [
            'success' => true,
            'message' => 'Xóa ngoại ngữ thành công',
        ];
    }
}
