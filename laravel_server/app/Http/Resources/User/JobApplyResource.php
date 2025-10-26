<?php

namespace App\Http\Resources\User;

use App\Models\CV;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class JobApplyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id'            => $this->id,
            'job_title'     => $this->job->title ?? null,
            'company_name'  => $this->job->company->name ?? null,
            'cv'            => $this->cv_id
                ? optional(CV::find($this->cv_id))->file_path
                : ['Chưa xác định'],
            'applied_at'    => $this->created_at->format('Y-m-d H:i:s'),
            'end_date'      => $this->job->end_date ?? null,
            'status'        => $this->status_text,
        ];
    }
}
