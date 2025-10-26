<?php

namespace App\Http\Services\Admin\Job;

use App\Constants\BaseConstants;
use App\Constants\HttpStatus;
use App\Models\Admin;
use App\Models\Job;
use App\Models\JobApply;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class JobApplyServices
{
    public function getAllJobApplyByAdmin(Request $request, $perPage)
    {
        $admin = $request->user();
        $query = JobApply::with(['job', 'user']);
        if ($admin->role !== BaseConstants::ROOT_ADMIN) {
            $query->whereHas('job', function ($q) use ($admin) {
                $q->where('company_id', $admin->company_id);
            });
        }
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getJobApplyById($id, $companyId)
    {
        $jobApply = JobApply::where('id', $id)
            ->whereHas('job', function ($query) use ($companyId) {
                $query->where('company_id', $companyId);
            })
            ->exists();
        return $jobApply;
    }

    public function updateStatus(int $id, int $adminId, int $status)
    {
        if (!in_array($status, [JobApply::STATUS_PENDING, JobApply::STATUS_ACCEPTED, JobApply::STATUS_REJECTED, JobApply::STATUS_INTERVIEW, JobApply::STATUS_OFFER, JobApply::STATUS_HIRED])) {
            return 'status_error';
        }
        DB::beginTransaction();
        try {
            $jobApply = JobApply::with('job')->find($id);
            if (!$jobApply) {
                return 'no_job';
            }
            $adminCompanyId = Admin::find($adminId)->company_id;
            if ($jobApply->job->company_id !== $adminCompanyId) {
                return 'no_role';
            }
            $jobApply->status = $status;
            $jobApply->save();
            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getApplicantByJob(int $jobId, int $adminId, int $perPage)
    {
        $admin = Admin::find($adminId);
        if ($admin->role !== BaseConstants::ROOT_ADMIN) {
            $job = Job::where('id', $jobId)
                ->where('company_id', $admin->company_id)
                ->first();
            if (!$job) {
                return false;
            }
        }
        return JobApply::with(['job', 'user'])
            ->where('job_id', $jobId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getCandidateDetail($id)
    {
        try {
            $application = JobApply::with(['user', 'job'])->findOrFail($id);
            return(object) [
                'user' => $application->user,
                'jobApply' => $application,
            ];
        } catch (ModelNotFoundException $e) {
            return null;
        }
    }
}
