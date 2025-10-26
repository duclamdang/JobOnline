<?php

namespace App\Http\Services\User\Job;

use App\Constants\HttpStatus;
use App\Models\JobApply;
use App\Models\JobSaved;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class JobSaveServices
{
    public function saved(Request $request, array $data): JobSaved|false
    {
        $userId = $request->user()->id;
        $exists = JobSaved::where('user_id', $userId)
            ->where('job_id', $data['job_id'])
            ->exists();
        if ($exists) {
            return false;
        }
        return JobSaved::create([
            'user_id' => $userId,
            'job_id'  => $data['job_id'],
        ]);
    }

    public function getAllJobSavedByUser(Request $request)
    {
        $userId = $request->user()->id;
        $perPage = 10;
        $savedJob = JobSaved::with('job.company', 'job.province')
        ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
        $savedJob->setCollection(
            $savedJob->getCollection()->map(function ($saved) {
                return $saved->job;
            })->filter()
        );
        return $savedJob;
    }

    public function deleteJobSaved(Request $request, int $job_id)
    {
        $userId = $request->user()->id;

        // Tìm bản ghi theo user_id + job_id
        $savedJob = JobSaved::where('user_id', $userId)
            ->where('job_id', $job_id)
            ->first();
        if (!$savedJob) {
            return 'not_found';
        }
        if ($savedJob->user_id !== $userId) {
            return 'forbidden';
        }
        $deletedId = $savedJob->job_id;
        $savedJob->delete();
        return $deletedId;
    }
}
