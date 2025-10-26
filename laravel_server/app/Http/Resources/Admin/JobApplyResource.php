<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Resources\Json\JsonResource;

class JobApplyResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'applied_at' => $this->created_at,
            'user' => [
                'id' => $this->user->id,
                'avatar' =>  $this->user->avatar ? asset('storage/' .  $this->user->avatar) : null,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'cv_id'      => $this->cv_id,
            ],
            'job' => [
                'id' => $this->job->id,
                'title' => $this->job->title,
                'company_id' => $this->job->company_id,
            ],
            'status' => $this->status,
        ];
    }
}

