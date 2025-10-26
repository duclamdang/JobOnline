<?php

namespace App\Http\Services\User\Profile;

use App\Models\UserCertificate;
use App\Models\User;

class UserCertificateService
{
    public function getAll(User $user): array
    {
        $certificates = UserCertificate::where('user_id', $user->id)->get();

        return [
            'success'      => true,
            'message'      => 'Lấy danh sách chứng chỉ thành công',
            'certificates' => $certificates,
        ];
    }

    public function getById(User $user, int $id): array
    {
        $certificate = UserCertificate::find($id);

        if (!$certificate) {
            return [
                'success' => false,
                'message' => "Chứng chỉ không tồn tại",
            ];
        }

        if ($certificate->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền truy cập chứng chỉ này",
            ];
        }

        return [
            'success'     => true,
            'message'     => 'Lấy chứng chỉ thành công',
            'certificate' => $certificate,
        ];
    }

    public function create(User $user, array $data): array
    {
        $imagePath = null;

        if (!empty($data['image_path']) && is_object($data['image_path'])) {
            $originalName = pathinfo($data['image_path']->getClientOriginalName(), PATHINFO_FILENAME);
            $extension    = $data['image_path']->getClientOriginalExtension();
            $uniqueId     = uniqid();
            $filename     = $originalName . '_' . $uniqueId . '.' . $extension;

            $imagePath = $data['image_path']->storeAs('users/certificates', $filename, 'public');
        }

        $certificate = UserCertificate::create([
            'user_id'    => $user->id,
            'name'       => $data['name'],
            'image_path' => $imagePath,
        ]);

        return [
            'success'     => true,
            'message'     => 'Thêm chứng chỉ thành công',
            'certificate' => $certificate,
        ];
    }

    public function update(User $user, int $id, array $data): array
    {
        $certificate = UserCertificate::find($id);

        if (!$certificate) {
            return [
                'success' => false,
                'message' => "Chứng chỉ không tồn tại",
            ];
        }

        if ($certificate->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền cập nhật chứng chỉ này",
            ];
        }

        if (!empty($data['image_path']) && is_object($data['image_path'])) {
            $originalName = pathinfo($data['image_path']->getClientOriginalName(), PATHINFO_FILENAME);
            $extension    = $data['image_path']->getClientOriginalExtension();
            $uniqueId     = uniqid();
            $filename     = $originalName . '_' . $uniqueId . '.' . $extension;

            $imagePath = $data['image_path']->storeAs('user/certificates', $filename, 'public');
        } else {
            $imagePath = $certificate->image_path;
        }

        $certificate->update([
            'name'    => $data['name']  ?? $certificate->name,
            'image_path'  => $imagePath,
        ]);

        return [
            'success'     => true,
            'message'     => 'Cập nhật chứng chỉ thành công',
            'certificate' => $certificate,
        ];
    }

    public function delete(User $user, int $id): array
    {
        $certificate = UserCertificate::find($id);

        if (!$certificate) {
            return [
                'success' => false,
                'message' => "Chứng chỉ không tồn tại",
            ];
        }

        if ($certificate->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => "Bạn không có quyền xóa chứng chỉ này",
            ];
        }

        $certificate->delete();

        return [
            'success' => true,
            'message' => 'Xóa chứng chỉ thành công',
        ];
    }
}
