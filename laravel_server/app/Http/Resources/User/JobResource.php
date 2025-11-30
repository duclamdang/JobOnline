<?php

namespace App\Http\Resources\User;

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
            'slug'          => $this->slug,
            'title'         => $this->title,
            'company_name' => $this->company?->name,
            'company_logo'  => $this->company?->logo
                ? asset($this->company->logo)
                : asset('images/default-logo.png'),
            'salary_range'  => $this->salary_from && $this->salary_to
                ? number_format($this->salary_from/1000000, 0) . " - " . number_format($this->salary_to/1000000, 0) . " triệu"
                : "Thoả thuận",
            'location' => $this->province?->name,
            'deadline'=> $deadline > 0 ? $deadline : 0,
        ];
    }
}
