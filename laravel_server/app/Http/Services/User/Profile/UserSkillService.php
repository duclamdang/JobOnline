<?php

namespace App\Http\Services\User\Profile;

use App\Models\UserSkill;
use App\Models\User;

class UserSkillService
{
    public function getAll(User $user): array
    {
        $skills = UserSkill::where('user_id', $user->id)->get();

        return [
            'success' => true,
            'message' => 'Lấy danh sách kỹ năng thành công',
            'skills'  => $skills,
        ];
    }

    public function getById(User $user, int $id): array
    {
        $skill = UserSkill::find($id);

        if (!$skill) {
            return [
                'success' => false,
                'message' => "Kỹ năng không tồn tại",
            ];
        }

        if ($skill->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền truy cập kỹ năng này",
            ];
        }

        return [
            'success' => true,
            'message' => 'Lấy kỹ năng thành công',
            'skill'   => $skill,
        ];
    }

    public function create(User $user, array $data): array
    {
        $data['user_id'] = $user->id;
        $skill = UserSkill::create($data);

        return [
            'success' => true,
            'message' => 'Thêm kỹ năng thành công',
            'skill'   => $skill,
        ];
    }

    public function update(User $user, int $id, array $data): array
    {
        $skill = UserSkill::find($id);

        if (!$skill) {
            return [
                'success' => false,
                'message' => "Kỹ năng không tồn tại",
            ];
        }

        if ($skill->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền cập nhật kỹ năng này",
            ];
        }

        $skill->update($data);

        return [
            'success' => true,
            'message' => 'Cập nhật kỹ năng thành công',
            'skill'   => $skill,
        ];
    }

    public function delete(User $user, int $id): array
    {
        $skill = UserSkill::find($id);

        if (!$skill) {
            return [
                'success' => false,
                'message' => "Kỹ năng không tồn tại",
            ];
        }

        if ($skill->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền xóa kỹ năng này",
            ];
        }

        $skill->delete();

        return [
            'success' => true,
            'message' => 'Xóa kỹ năng thành công',
        ];
    }
}
