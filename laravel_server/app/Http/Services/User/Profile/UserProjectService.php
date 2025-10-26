<?php

namespace App\Http\Services\User\Profile;

use App\Models\UserProject;
use App\Models\User;

class UserProjectService
{
    public function getAll(User $user): array
    {
        $projects = UserProject::where('user_id', $user->id)->get();

        return [
            'success' => true,
            'message' => 'Lấy danh sách dự án thành công',
            'projects' => $projects,
        ];
    }

    public function getById(User $user, int $id): array
    {
        $project = UserProject::find($id);

        if (!$project) {
            return [
                'success' => false,
                'message' => "Dự án không tồn tại",
            ];
        }

        if ($project->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền truy cập dự án này",
            ];
        }

        return [
            'success' => true,
            'message' => 'Lấy dự án thành công',
            'project' => $project,
        ];
    }

    public function create(User $user, array $data): array
    {
        $data['user_id'] = $user->id;
        $project = UserProject::create($data);

        return [
            'success' => true,
            'message' => 'Thêm dự án thành công',
            'project' => $project,
        ];
    }

    public function update(User $user, int $id, array $data): array
    {
        $project = UserProject::find($id);

        if (!$project) {
            return [
                'success' => false,
                'message' => "Dự án không tồn tại",
            ];
        }

        if ($project->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền cập nhật dự án này",
            ];
        }

        $project->update($data);

        return [
            'success' => true,
            'message' => 'Cập nhật dự án thành công',
            'project' => $project,
        ];
    }

    public function delete(User $user, int $id): array
    {
        $project = UserProject::find($id);

        if (!$project) {
            return [
                'success' => false,
                'message' => "Dự án không tồn tại",
            ];
        }

        if ($project->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền xóa dự án này",
            ];
        }

        $project->delete();

        return [
            'success' => true,
            'message' => 'Xóa dự án thành công',
        ];
    }
}
