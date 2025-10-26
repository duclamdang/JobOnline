<?php

namespace App\Http\Services\User\Profile;

use App\Models\UserWorkExperience;
use App\Models\User;

class UserWorkExperienceService
{
    public function getAll(User $user): array
    {
        $experiences = UserWorkExperience::where('user_id', $user->id)->get();

        return [
            'success'     => true,
            'message'     => 'Lấy danh sách kinh nghiệm làm việc thành công',
            'experiences' => $experiences,
        ];
    }

    public function getById(User $user, int $id): array
    {
        $experience = UserWorkExperience::find($id);

        if (!$experience) {
            return [
                'success' => false,
                'message' => "Kinh nghiệm làm việc không tồn tại",
            ];
        }

        if ($experience->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền truy cập kinh nghiệm làm việc này",
            ];
        }

        return [
            'success'    => true,
            'message'    => 'Lấy kinh nghiệm làm việc thành công',
            'experience' => $experience,
        ];
    }

    public function create(User $user, array $data): array
    {
        $data['user_id'] = $user->id;
        $experience = UserWorkExperience::create($data);

        return [
            'success'    => true,
            'message'    => 'Thêm kinh nghiệm làm việc thành công',
            'experience' => $experience,
        ];
    }

    public function update(User $user, int $id, array $data): array
    {
        $experience = UserWorkExperience::find($id);

        if (!$experience) {
            return [
                'success' => false,
                'message' => "Kinh nghiệm làm việc không tồn tại",
            ];
        }

        if ($experience->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền cập nhật kinh nghiệm làm việc này",
            ];
        }

        $experience->update($data);

        return [
            'success'    => true,
            'message'    => 'Cập nhật kinh nghiệm làm việc thành công',
            'experience' => $experience,
        ];
    }

    public function delete(User $user, int $id): array
    {
        $experience = UserWorkExperience::find($id);

        if (!$experience) {
            return [
                'success' => false,
                'message' => "Kinh nghiệm làm việc không tồn tại",
            ];
        }

        if ($experience->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền xóa kinh nghiệm làm việc này",
            ];
        }

        $experience->delete();

        return [
            'success' => true,
            'message' => 'Xóa kinh nghiệm làm việc thành công',
        ];
    }
}
