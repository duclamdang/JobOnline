<?php

namespace App\Http\Services\User\Job;

use App\Constants\HttpStatus;
use App\Models\CV;
use App\Models\JobApply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;


class JobApplyServices
{
    public function apply(Request $request, array $data)
    {
        $userId = $request->user()->id;
        $cvExists = CV::where('id', $data['cv_id'])
            ->where('user_id', $userId)
            ->exists();
        if (!$cvExists) {
            return 'invalid_cv';
        }
        $exists = JobApply::where('user_id', $userId)
            ->where('job_id', $data['job_id'])
            ->exists();
        if ($exists) {
            return 'already_applied';
        }
        return JobApply::create([
            'user_id' => $userId,
            'job_id'  => $data['job_id'],
            'cv_id'   => $data['cv_id'],
            'status'  => JobApply::STATUS_PENDING,
        ]);
    }

    public function getAllJobApplyByUser(Request $request)
    {
        $userId = $request->user()->id;
        $perPage = 10;
        $jobApplies = JobApply::with([
            'job.company',
            'job.province'
        ])
            ->where ('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        return $jobApplies;
    }
}
