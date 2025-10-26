<?php

namespace App\Http\Services\Admin\Job;
use App\Http\Resources\Admin\JobResource;
use App\Models\Job;
use App\Models\WorkField;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JobService
{
    public function getAllJob($companyId)
    {
        $perPage = 10;
        $jobs = Job::where('company_id', $companyId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        return JobResource::collection($jobs);
    }

    public function getJobById($companyId, $id)
    {
        $job = Job::where('id', $id)
            ->where('company_id', $companyId)
            ->firstOrFail();
        $similarJobs = Job::with(['company', 'province'])
            ->whereJsonContains('work_field_id', $job->work_field_id)
            ->where('id', '<>', $job->id)
            ->where('is_active', Job::IS_ACTIVE)
            ->where('end_date', '>=', Carbon::now())
            ->limit(5)
            ->get();
        return $job;
    }
    public function __construct(Job $job)
    {
        $this->model = $job;
    }
    public function createJob(array $data = []): Job
    {
        $title = $data['title'];
        $slug = Str::slug($title);

        return $this->model::create([
            'company_id'         => $data['company_id'],
            'title'              => $data['title'] ?? null,
            'create_by'           => $data['create_by'],
            'description'        => $data['description'] ?? null,
            'quantity'           => $data['quantity'] ?? null,
            'salary_from'        => $data['salary_from'] ?? null,
            'salary_to'          => $data['salary_to'] ?? null,
            'province_id'        => $data['province_id'] ?? null,
            'working_form_id'    => $data['working_form_id'] ?? null,
            'work_field_id'      => $data['work_field_id'] ?? null,
            'work_experience_id' => $data['work_experience_id'] ?? null,
            'education_id'       => $data['education_id'] ?? null,
            'position_id'        => $data['position_id'] ?? null,
            'requirements'       => $data['requirements'] ?? null,
            'end_date'           => $data['end_date'] ?? null,
            'is_fulltime'        => $data['is_fulltime'] ?? true,
            'slug'               => $slug,
            'skills'             => $data['skills'] ?? null,
            'is_active'          => $data['is_active'] ?? true,
            'is_urgent'          => $data['is_urgent'] ?? false,
            'gender'             => $data['gender'] ?? 0,
            'salary_negotiable'  => $data['salary_negotiable'] ?? false,
            'benefit'            => $data['benefit'] ?? null,
            'address'            => $data['address'] ?? null,
            'district_id'        => $data['district_id'] ?? null,
        ]);
    }


    public function updateJob(int $id, array $data, $user): Job
    {
        DB::beginTransaction();
        $job = Job::findOrFail($id);
        if ($job->company_id !== $user->company_id) {
            throw new \Exception("Bạn không có quyền cập nhật công việc này.");
        }
        try {
            if (!isset($data['slug']) || $data['slug'] !== $job->slug) {
                $slugBase = !empty($data['slug'])
                    ? Str::slug($data['slug'])
                    : Str::slug($data['title'] ?? $job->title);
                $data['slug'] = $slugBase;
            }

            $job->fill($data)->save();

            DB::commit();

            return $job;
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            //  throw new \Exception(__('Đã xảy ra sự cố khi cập nhật công việc này. Vui lòng thử lại.'));
            }
    }


//    public function deleteJob($id): bool
//    {
//        $job = Job::findOrFail($id);
//        return $job->delete();
//    }
    public function getByConditions(array $conditions, $companyId, $perPage = 15)
    {
        $query = Job::with(['company', 'province'])
            ->where('company_id', $companyId);

        if (!empty($conditions['keyword'])) {
            $keyword = $conditions['keyword'];
            $query->where(function ($q) use ($keyword) {
                $q->where('title', 'LIKE', "%{$keyword}%")
                    ->orWhere('description', 'LIKE', "%{$keyword}%");
            });
        }

        if (!empty($conditions['fields'])) {
            $query->whereJsonContains('work_field_id', (int) $conditions['fields']);
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
            $gender = (int) $conditions['gender'];
            $query->where('gender', $gender);
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
        return $query->paginate($perPage);
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
            $query->whereJsonContains('work_field_id',(int) $conditions['work_field_id']);
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
                    'count' => $counts[$field->id] ?? 0, // key là int
                    'logo'  => $field->logo,
                ];
            })
            ->sortByDesc('count')
            ->take(10)
            ->values();

        return $workFields;
    }
}
