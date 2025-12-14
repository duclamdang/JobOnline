<?php

namespace App\Http\Services\User\Profile;

use App\Models\CV;
use App\Models\User;
use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Cloudinary\Configuration\Configuration;
use Illuminate\Support\Str;


class ProfileService
{
    public function getProfile(User $user): array
    {
        return [
            'success' => true,
            'message' => 'Lấy thông tin user thành công',
            'data' => array_merge(
                $this->getBasicInfo($user),
                $this->getJobCriteria($user),
                $this->getGeneralInfo($user),
                [
                    'cvs'         => $this->getCV($user),
                    'avatar'      => $user->avatar,
                    'is_verify'   => $user->is_verify,
                    'verified_by' => $user->verified_by,
                    'verified_at' => $user->verified_at,
                    'email'       => $user->email,
                    'created_at'  => $user->created_at,
                    'updated_at'  => $user->updated_at,
                ]
            ),
        ];
    }

    public function getBasicInfo(User $user): array
    {
        return [
            'id'          => $user->id,
            'name'             => $user->name,
            'email'      => $user->email,
            'birthday'         => $user->birthday,
            'phone'             => $user->phone,
            'address'          => $user->address,
            'gender'           => $user->gender,
            'bank_info'         => $user->bank_info,
            'job_search_status' => $user->job_search_status,
        ];
    }

    public function getCV(User $user): array
    {
        return $user->cvs()->get()->toArray();
    }

    public function getJobCriteria(User $user): array
    {
        return [
            'desired_position' => $user->desired_position,
            'work_field'       => $user->workField,
            'province'         => $user->province,
            'min_salary'       => $user->min_salary,
            'max_salary'       => $user->max_salary,
            'working_form'     => $user->workingForm,
        ];
    }

    public function getGeneralInfo(User $user): array
    {
        return [
            'work_experience' => $user->workExperience,
            'position'        => $user->position,
            'education'       => $user->education,
        ];
    }

    public function updateBasicInfo(User $user, array $data): array
    {
        $user->update([
            'name'              => $data['name']              ?? $user->name,
            'birthday'          => $data['birthday']          ?? $user->birthday,
            'address'           => $data['address']           ?? $user->address,
            'gender'            => $data['gender']            ?? $user->gender,
            'bank_info'         => $data['bank_info']         ?? $user->bank_info,
        ]);

        return [
            'success' => true,
            'message' => 'Cập nhật thông tin cơ bản thành công',
            'user'    => $user,
        ];
    }

    public function updateJobSearchStatus(User $user, array $data): array
    {
        $user->update([
            'job_search_status' => $data['job_search_status'] ?? $user->job_search_status,
        ]);

        return [
            'success' => true,
            'message' => 'Cập nhật trạng thái tìm việc thành công',
            'user'    => $user,
        ];
    }

    public function updateAvatar(User $user, $fileOrPath): array
    {
        if ($fileOrPath && is_object($fileOrPath)) {
            $config = new Configuration([
                'cloud' => [
                    'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                    'api_key'    => env('CLOUDINARY_API_KEY'),
                    'api_secret' => env('CLOUDINARY_API_SECRET'),
                ],
            ]);

            $cloudinary = new Cloudinary($config);

            try {
                $uploaded = $cloudinary->uploadApi()->upload(
                    $fileOrPath->getRealPath(),
                    ['folder' => 'users/images']
                );

                $avatarUrl = $uploaded['secure_url'];
                $publicId  = $uploaded['public_id'];

                if (!empty($user->avatar_public_id)) {
                    $cloudinary->uploadApi()->destroy($user->avatar_public_id);
                }

            } catch (\Exception $e) {
                Log::error('Cloudinary upload error: ' . $e->getMessage());
                $avatarUrl = $user->avatar;
                $publicId  = $user->avatar_public_id ?? null;
            }

        } else {
            $avatarUrl = $user->avatar;
            $publicId  = $user->avatar_public_id ?? null;
        }

        $user->update([
            'avatar'           => $avatarUrl,
            'avatar_public_id' => $publicId,
        ]);

        return [
            'success' => true,
            'message' => 'Cập nhật ảnh đại diện thành công',
            'user'    => $user,
        ];
    }

    public function createCV(User $user, UploadedFile $fileOrPath): array
    {
        if (!$fileOrPath || !$fileOrPath->isValid()) {
            return [
                'success' => false,
                'message' => 'File CV không hợp lệ',
            ];
        }

        // Tạo tên file đẹp + unique
        $originalName = pathinfo($fileOrPath->getClientOriginalName(), PATHINFO_FILENAME);
        $extension    = $fileOrPath->getClientOriginalExtension() ?: 'pdf';
        $safeName     = Str::slug($originalName) ?: 'cv';
        $filename     = $safeName . '_' . uniqid() . '.' . $extension;

        try {
            // Lưu vào storage/app/public/users/cvs
            // disk: public  ->  url = APP_URL/storage/...
            $path = $fileOrPath->storeAs('users/cvs', $filename, 'public');
            // $path ví dụ: "users/cvs/cv-duc-lam_68d0c6d7edeb6.pdf"

        } catch (\Exception $e) {
            \Log::error('Upload CV local error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Upload CV thất bại, vui lòng thử lại sau',
            ];
        }

        $hasCV = $user->cvs()->exists();

        $cv = $user->cvs()->create([
            'file_name'    => $fileOrPath->getClientOriginalName(),
            'file_path'    => $path,
            'main_cv'      => !$hasCV,
            'cv_public_id' => null,
        ]);

        return [
            'success' => true,
            'message' => 'Thêm CV thành công',
            'cv'      => $cv,
        ];
    }

    public function deleteCV(User $user, int $id): array
    {
        $cv = CV::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$cv) {
            return [
                'success' => false,
                'message' => 'CV không tồn tại hoặc bạn không có quyền xoá',
            ];
        }

        $wasMain = (bool) $cv->main_cv;

        if (!empty($cv->cv_public_id)) {
            try {
                $config = new Configuration([
                    'cloud' => [
                        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                        'api_key'    => env('CLOUDINARY_API_KEY'),
                        'api_secret' => env('CLOUDINARY_API_SECRET'),
                    ],
                ]);

                $cloudinary = new Cloudinary($config);

                $cloudinary->uploadApi()->destroy(
                    $cv->cv_public_id,
                    ['resource_type' => 'raw']
                );
            } catch (\Exception $e) {
                Log::error('Cloudinary delete CV error: ' . $e->getMessage());
            }
        }
        elseif ($cv->file_path
            && !str_starts_with($cv->file_path, 'http')
            && Storage::disk('public')->exists($cv->file_path)
        ) {
            Storage::disk('public')->delete($cv->file_path);
        }
        $cv->delete();
        if ($wasMain) {
            $nextCv = $user->cvs()->orderByDesc('id')->first();
            if ($nextCv) {
                $nextCv->update(['main_cv' => true]);
            }
        }

        return [
            'success' => true,
            'message' => 'Xoá CV thành công',
        ];
    }


    public function updateMainCV(User $user, int $id): array
    {
        $cv = CV::find($id);

        if (!$cv) {
            return [
                'success' => false,
                'message' => 'CV không tồn tại',
            ];
        }

        if ($cv->user_id !== $user->id) {
            return [
                'success' => false,
                'message' => 'Bạn không có quyền chỉnh sửa CV này',
            ];
        }

        $currentMain = $user->cvs()->where('main_cv', true)->first();
        if ($currentMain && $currentMain->id !== $cv->id) {
            $currentMain->update(['main_cv' => false]);
        }

        $cv->update(['main_cv' => true]);
        $cv->refresh();

        return [
            'success' => true,
            'message' => 'Cập nhật CV chính thành công',
            'cv'      => $cv,
        ];
    }

    public function updateJobCriteria(User $user, array $data): array
    {
        $user->update([
            'desired_position' => $data['desired_position'] ?? $user->desired_position,
            'work_field_id'    => $data['work_field_id']    ?? $user->work_field_id,
            'province_id'      => $data['province_id']      ?? $user->province_id,
            'min_salary'       => $data['min_salary']       ?? $user->min_salary,
            'max_salary'       => $data['max_salary']       ?? $user->max_salary,
            'working_form_id'  => $data['working_form_id']  ?? $user->working_form_id,
        ]);

        return [
            'success' => true,
            'message' => 'Cập nhật tiêu chí tìm việc thành công',
            'user'    => $user,
        ];
    }

    public function updateGeneralInfo(User $user, array $data): array
    {
        $user->update([
            'work_experience_id' => $data['work_experience_id'] ?? $user->work_experience_id,
            'position_id'        => $data['position_id']        ?? $user->position_id,
            'education_id'       => $data['education_id']       ?? $user->education_id,
        ]);

        return [
            'success' => true,
            'message' => 'Cập nhật thông tin chung thành công',
            'user'    => $user,
        ];
    }


    public function changePassword(User $user, string $currentPassword, string $newPassword): array
    {
        if (!Hash::check($currentPassword, $user->password)) {
            return [
                'success' => false,
                'message' => 'Mật khẩu hiện tại không chính xác',
            ];
        }

        $user->update([
            'password' => Hash::make($newPassword),
        ]);

        return [
            'success' => true,
            'message' => 'Đổi mật khẩu thành công',
        ];
    }
}
