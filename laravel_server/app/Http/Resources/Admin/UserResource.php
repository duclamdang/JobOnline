<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        $admin = $request->user();
        $purchased = $admin->purchasedUsers()->where('user_id', $this->id)->exists();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $purchased ? $this->phone : null,
            'email' => $purchased ? $this->email : null,
            'birthday' => $this->birthday,
            'address' => $this->address,
            'gender' => match($this->gender) {
                '1' => 'Nam',
                '0' => 'Nữ',
                default => 'Không xác định',
            },
            'avatar' => $this->avatar,
            'bank_info' => $this->bank_info,
            'desired_position' => $this->desired_position,
            'work_field_title' => $this->workField?->title ?? null,
            'province_title' => $this->province?->name ?? null,
            'min_salary' => $this->min_salary,
            'max_salary' => $this->max_salary,
            'working_form_title' => $this->workingForm?->title ?? null,
            'work_experience_title' => $this->workExperience?->title ?? null,
            'position_title' => $this->position?->title ?? null,
            'education_title' => $this->education?->title ?? null,
            'is_verify' => $this->is_verify,
            'verified_by' => $this->verified_by,
            'verified_at' => $this->verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'is_active' => $this->is_active,
            'job_search_status_text' => match($this->job_search_status) {
                0 => 'Không tìm việc',
                1 => 'Đang mở cơ hội',
                2 => 'Đang tích cực tìm việc',
                default => 'Không xác định',
            },
        ];
    }
}
