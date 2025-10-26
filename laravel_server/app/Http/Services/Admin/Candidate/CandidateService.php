<?php

namespace App\Http\Services\Admin\Candidate;

use App\Models\User;

class CandidateService
{
    protected array $profileFields = [
        'name',
        'email',
        'birthday',
        'phone',
        'address',
        'gender',
        'avatar',
        'bank_info',
        'desired_position',
        'work_field_id',
        'province_id',
        'min_salary',
        'max_salary',
        'working_form_id',
        'work_experience_id',
        'position_id',
        'education_id',
    ];

    protected function calculateCompletion(User $user): float
    {
        $filled = 0;

        foreach ($this->profileFields as $field) {
            $val = $user->{$field} ?? null;
            if (!is_null($val) && $val !== '') {
                $filled++;
            }
        }

        return round(($filled / count($this->profileFields)) * 100, 2);
    }

    public function filterCandidates(array $filters = [], int $perPage = 10): array
    {
        $query = User::query()
            ->active()
            ->where('job_search_status', '!=', User::JOB_SEARCH_NONE)
            ->with(['education', 'position', 'workingForm', 'workField', 'province', 'workExperience'])
            ->latest('id');

        if (!empty($filters['desired_position'])) {
            $keyword = strtolower($filters['desired_position']);
            $query->where(function ($q) use ($keyword) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$keyword}%"])
                    ->orWhereRaw('LOWER(desired_position) LIKE ?', ["%{$keyword}%"]);
            });
        }

        if (!empty($filters['work_field_id'])) {
            $query->where('work_field_id', $filters['work_field_id']);
        }

        if (!empty($filters['province_id'])) {
            $query->where('province_id', $filters['province_id']);
        }

        if (!empty($filters['working_form_id'])) {
            $query->where('working_form_id', $filters['working_form_id']);
        }

        if (!empty($filters['work_experience_id'])) {
            $query->where('work_experience_id', $filters['work_experience_id']);
        }

        if (!empty($filters['position_id'])) {
            $query->where('position_id', $filters['position_id']);
        }

        if (!empty($filters['education_id'])) {
            $query->where('education_id', $filters['education_id']);
        }

        if (!empty($filters['min_salary'])) {
            $query->where('min_salary', '>=', $filters['min_salary']);
        }

        if (!empty($filters['max_salary'])) {
            $query->where('max_salary', '<=', $filters['max_salary']);
        }

        $candidates = $query->paginate($perPage);

        $candidates->getCollection()->transform(function ($user) {
            $completion = $this->calculateCompletion($user);
            if ($completion >= 80) {
                return $user;
            }
            return null;
        })->filter();

        return [
            'success'    => true,
            'message'    => "Lấy danh sách ứng viên thành công",
            'candidates' => $candidates,
        ];
    }

    public function getCandidateDetail(int $id): array
    {
        $user = User::with([
            'education',
            'position',
            'workingForm',
            'workField',
            'province',
            'workExperience',
            'cvs' => function ($q) {
                $q->where('main_cv', true);
            }
        ])
            ->where('job_search_status', '!=', User::JOB_SEARCH_NONE)
            ->find($id);

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Ứng viên không tồn tại hoặc không cho phép xem hồ sơ',
            ];
        }

        $completion = $this->calculateCompletion($user);

        if ($completion < 80) {
            return [
                'success' => false,
                'message' => 'Ứng viên chưa đủ điều kiện hiển thị',
            ];
        }

        return [
            'success'   => true,
            'message'   => 'Lấy thông tin ứng viên thành công',
            'candidate' => $user,
        ];
    }
}
