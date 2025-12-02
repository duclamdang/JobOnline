<?php

namespace App\Http\Services\User\Job;

use App\Http\Resources\User\DetailJobResource;
use App\Http\Resources\User\JobResource;
use App\Models\Job;
use App\Models\WorkField;
use Carbon\Carbon;

class JobServices
{
    protected $salaryRange;

    public function __construct()
    {
        $this->salaryRange = config('salary.range');
    }

    public function getAllJob($perPage = 100)
    {
        $now = Carbon::now();
        $jobs = Job::query()
            ->where('end_date', '>=', $now)
            ->where('is_active', Job::IS_ACTIVE)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return JobResource::collection($jobs);
    }

    public function getJobByCompany($companyId, $perPage = 100)
    {
        $now = Carbon::now();
        $jobs = Job::query()
            ->where('end_date', '>=', $now)
            ->where('is_active', Job::IS_ACTIVE)
            ->where('company_id', $companyId)
            ->paginate($perPage);

        return JobResource::collection($jobs);
    }

    public function getByConditions(array $conditions, $perPage = 15)
    {
        $now = Carbon::now();

        $query = Job::with(['company', 'province'])
            ->where('end_date', '>=', $now)
            ->where('is_active', Job::IS_ACTIVE);

        if (!empty($conditions['keyword'])) {
            $keyword = trim($conditions['keyword']);

            $query->where(function ($q) use ($keyword) {
                $kw = mb_strtolower($keyword, 'UTF-8');
                $like = "%{$kw}%";

                $q->whereRaw('unaccent(lower(title)) LIKE unaccent(?)', [$like])
                    ->orWhereRaw('unaccent(lower(description)) LIKE unaccent(?)', [$like]);
            });
        }

        if (!empty($conditions['fields'])) {
            $fields = is_array($conditions['fields'])
                ? $conditions['fields']
                : explode(',', $conditions['fields']);
            $query->where(function ($q) use ($fields) {
                foreach ($fields as $field) {
                    $q->orWhereJsonContains('work_field_id', (int) $field);
                }
            });
        }

        if (!empty($conditions['location'])) {
            $query->where('province_id', $conditions['location']);
        }

        if (!empty($conditions['salary'])) {
            $salaryRange = config("salary.range.{$conditions['salary']}");
            if ($salaryRange) {
                $from = (int) $salaryRange['from'];
                $to   = (int) $salaryRange['to'];
                $query->where(function ($q) use ($from, $to) {
                    $q->whereBetween('salary_from', [$from, $to])
                        ->orWhereBetween('salary_to', [$from, $to]);
                });
            }
        }

        if (isset($conditions['gender']) && $conditions['gender'] !== '') {
            $query->where('gender', (int) $conditions['gender']);
        }

        if (!empty($conditions['experience'])) {
            $query->where('work_experience_id', (int) $conditions['experience']);
        }

        if (!empty($conditions['position'])) {
            $query->where('position_id', (int) $conditions['position']);
        }

        if (!empty($conditions['education'])) {
            $query->where('education_id', (int) $conditions['education']);
        }

        if (!empty($conditions['working_form'])) {
            $query->where('working_form_id', (int) $conditions['working_form']);
        }

        // ✅ Cho phép FE truyền per_page tùy ý, mặc định 100
        $pageSize = isset($conditions['per_page']) ? (int) $conditions['per_page'] : 100;

        return $query->paginate($pageSize);
    }

    public function getUrgentJobs(array $conditions = [], $perPage = 10)
    {
        $now = Carbon::now();
        $query = Job::with(['company:id,name,logo'])
            ->where('end_date', '>=', $now)
            ->where('is_active', Job::IS_ACTIVE)
            ->where('is_urgent', 1);

        if (!empty($conditions['work_field_id'])) {
            $query->whereJsonContains('work_field_id', (int) $conditions['work_field_id']);
        }

        $jobs = $query->paginate($perPage);
        return JobResource::collection($jobs);
    }

    public function getImmediatelyJobs(array $conditions = [], $perPage = 10)
    {
        $now = Carbon::now();
        $query = Job::with(['company:id,name,logo'])
            ->where('end_date', '>=', $now)
            ->where('is_active', Job::IS_ACTIVE)
            ->orderBy('end_date', 'asc');

        if (!empty($conditions['work_field_id'])) {
            $query->whereJsonContains('work_field_id', (int) $conditions['work_field_id']);
        }

        $jobs = $query->paginate($perPage);
        return JobResource::collection($jobs);
    }

    public function getJobCountsByWorkField()
    {
        $now = Carbon::now();
        $counts = Job::selectRaw("jsonb_array_elements_text(work_field_id::jsonb)::int as work_field, COUNT(*) as total")
            ->where('end_date', '>=', $now)
            ->where('is_active', Job::IS_ACTIVE)
            ->groupBy('work_field')
            ->pluck('total', 'work_field');

        $workFields = WorkField::select('id', 'title', 'logo')
            ->get()
            ->map(function ($field) use ($counts) {
                return [
                    'id'    => $field->id,
                    'title' => $field->title,
                    'count' => $counts[$field->id] ?? 0,
                    'logo'  => $field->logo,
                ];
            })
            ->sortByDesc('count')
            ->take(10)
            ->values();

        return $workFields;
    }

    public function getJobById($id)
    {
        $job = Job::findOrFail($id);

        if (Carbon::parse($job->end_date)->isPast()) {
            throw new \Exception("Công việc này đã hết hạn.");
        }

        $similarJobs = Job::with(['company', 'province'])
            ->whereJsonContains('work_field_id', $job->work_field_id)
            ->where('id', '<>', $job->id)
            ->where('is_active', Job::IS_ACTIVE)
            ->where('end_date', '>=', Carbon::now())
            ->limit(5)
            ->get();

        return new DetailJobResource($job, $similarJobs);
    }
}
