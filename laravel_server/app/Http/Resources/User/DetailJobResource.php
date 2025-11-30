<?php

namespace App\Http\Resources\User;

use App\Models\Job;
use App\Models\WorkField;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class DetailJobResource extends JsonResource
{
    protected $similarJobs;

    public function __construct($resource, $similarJobs = null)
    {
        parent::__construct($resource);
        $this->similarJobs = $similarJobs;
    }

    public function toArray(Request $request): array
    {
        $deadline  = Carbon::now()->diffInDays(Carbon::parse($this->end_date), false);

        $user = $request->user();
        $isApplied = false;
        $appliedCv = null;
        if ($user && $this->resource instanceof Job) {
            $application = $this->resource->jobapply()
                ->with('cv')
                ->where('user_id', $user->id)
                ->latest('created_at')
                ->first();

            if ($application) {
                $isApplied = true;

                $cv = $application->cv;
                if ($cv) {
                    $appliedCv = [
                        'id'         => $cv->id,
                        'file_name'  => $cv->file_name,
                        'file_path'   => $cv->file_path,
                        'created_at' => $cv->created_at,
                    ];
                }
            }
        }

        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'create_by'     => $this->create_by,
            'company_name'  => $this->company->name ?? null,
            'company_id'    => $this->company->id ?? null,
            'company_slug'  => $this->company->slug ?? null,
            'company_logo'  => $this->company?->logo
                ? asset($this->company->logo)
                : asset('images/default-logo.png'),

            'salary_range'  => $this->salary_from && $this->salary_to
                ? number_format($this->salary_from/1000000, 0) . " - " . number_format($this->salary_to/1000000, 0) . " triệu"
                : "Thoả thuận",

            'company_address'  => $this->company->address ?? null,
            'company_size'     => $this->company->size ?? null,
            'location'         => $this->province->name ?? null,
            'deadline '        => $deadline > 0 ? $deadline : 0,
            'description'      => $this->description,
            'quantity'         => $this->quantity,
            'working_form'     => $this->working_form?->title ?? 'Chưa xác định',
            'work_fields'      => $this->work_field_id
                ? WorkField::whereIn('id', $this->work_field_id)->pluck('title')->toArray()
                : ['Chưa xác định'],
            'work_experience'  => $this->work_experience?->title ?? 'Chưa xác định',
            'education'        => $this->education?->title ?? 'Chưa xác định',
            'position'         => $this->position?->title ?? 'Chưa xác định',
            'requirement'      => $this->requirements,
            'end_date'         => $this->end_date,
            'is_fulltime'      => $this->is_fulltime ? "fulltime" : "part-time",
            'slug'             => $this->slug,
            'skills'           => $this->skills,
            'gender'           => match($this->gender) {
                1 => 'Nam',
                2 => 'Nữ',
                default => 'Không yêu cầu',
            },
            'is_active'        => $this->is_active ? "Còn tuyển" : "Ngưng tuyển",
            'is_urgent'        => $this->is_urgent ? "Gấp" : "Không gấp",
            'benefit'          => $this->benefit,
            'salary_negotiable'=> $this->salary_negotiable,
            'address'          => $this->address,
            'district'         => $this->district?->name ?? null,
            'is_applied'       => $isApplied,
            'applied_cv'       => $appliedCv,

            'similar_job'      => $this->similarJobs
                ? JobResource::collection($this->similarJobs)
                : [],
        ];
    }
}
