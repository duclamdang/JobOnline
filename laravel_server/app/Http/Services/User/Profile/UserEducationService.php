<?php

namespace App\Http\Services\User\Profile;

use App\Models\UserEducation;
use App\Models\User;

class UserEducationService
{
    public function getAll(User $user): array
    {
        $educations = UserEducation::with(['major', 'education'])
            ->where('user_id', $user->id)
            ->get();

        return [
            'success'    => true,
            'message'    => 'Lấy danh sách học vấn thành công',
            'educations' => $educations,
        ];
    }

    public function getById(User $user, int $id): array
    {
        $education = UserEducation::find($id);

        if (!$education) {
            return [
                'success' => false,
                'message' => "Học vấn không tồn tại",
            ];
        }

        if ($education->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền truy cập học vấn này",
            ];
        }

        return [
            'success'   => true,
            'message'   => 'Lấy học vấn thành công',
            'education' => $education,
        ];
    }

    public function create(User $user, array $data): array
    {
        $data['user_id'] = $user->id;
        $education = UserEducation::create($data);

        return [
            'success'   => true,
            'message'   => 'Thêm học vấn thành công',
            'education' => $education,
        ];
    }

    public function update(User $user, int $id, array $data): array
    {
        $education = UserEducation::find($id);

        if (!$education) {
            return [
                'success' => false,
                'message' => "Học vấn không tồn tại",
            ];
        }

        if ($education->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền cập nhật học vấn này",
            ];
        }

        $education->update($data);

        return [
            'success'   => true,
            'message'   => 'Cập nhật học vấn thành công',
            'education' => $education,
        ];
    }

    public function delete(User $user, int $id): array
    {
        $education = UserEducation::find($id);

        if (!$education) {
            return [
                'success' => false,
                'message' => "Học vấn không tồn tại",
            ];
        }

        if ($education->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền xóa học vấn này",
            ];
        }

        $education->delete();

        return [
            'success' => true,
            'message' => 'Xóa học vấn thành công',
        ];
    }
}
