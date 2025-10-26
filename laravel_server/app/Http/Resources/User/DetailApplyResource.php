<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DetailApplyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $user = $this->user;
        $jobApply = $this->jobApply;
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'birthday' => $user->birthday ? $user->birthday->format('Y-m-d') : null,
            'phone' => $user->phone,
            'address' => $user->address,
            'gender' => match($user->gender) {
                '1' => 'Nam',
                '0' => 'Nữ',
                default => 'Không xác định',
            },
            'avatar' => $user->avatar ? asset('storage/' . $user->avatar) : asset('images/default-avatar.png'),
            'bank_info' => $user->bank_info,
            'job_search_status' => $user->job_search_status,
            'job_search_status_text' => match($user->job_search_status) {
                0 => 'Không tìm việc',
                1 => 'Đang mở cơ hội',
                2 => 'Đang tích cực tìm việc',
                default => 'Không xác định',
            },
            'desired_position' => $user->desired_position,
            'salary_range' => $user->min_salary && $user->max_salary
                ? number_format($user->min_salary / 1000000, 0) . ' - ' . number_format($user->max_salary / 1000000, 0) . ' triệu'
                : 'Thoả thuận',
            'work_field' => optional($user->workField)->title ?? 'Chưa xác định',
            'province' => optional($user->province)->name ?? 'Chưa xác định',
            'working_form' => optional($user->workingForm)->title ?? 'Chưa xác định',
            'work_experience' => optional($user->workExperience)->title ?? 'Chưa xác định',
            'position' => optional($user->position)->title ?? 'Chưa xác định',
            'education' => optional($user->education)->title ?? 'Chưa xác định',
            'status' => optional($jobApply)->status,
            'applied_at' => optional($jobApply)->created_at,
            'cv_file' => optional($jobApply->cv)->file_path
                ? asset('storage/' . $jobApply->cv->file_path)
                : null,
        ];
    }
}
