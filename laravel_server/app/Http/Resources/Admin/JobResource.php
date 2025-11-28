<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class JobResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $deadline  = Carbon::now()->diffInDays(Carbon::parse($this->end_date), false);

        return [
            'id'            => $this->id,
            'title'         => $this->title,
            'company_name' => $this->company?->name,
            'company_logo'  => $this->company?->logo
                ? asset($this->company->logo)
                : asset('images/default-logo.png'),
            'salary_range'  => $this->salary_from && $this->salary_to
                ? number_format($this->salary_from/1000000, 0) . " - " . number_format($this->salary_to/1000000, 0) . " triệu"
                : null,
            'salary_negotiable' => (bool) $this->salary_negotiable,
            'location' => $this->province?->name,
            'deadline'=> $deadline > 0 ? $deadline : 0,
            'end_date' => $this->end_date,
            'is_active'     => (bool) $this->is_active,
        ];
    }
}
