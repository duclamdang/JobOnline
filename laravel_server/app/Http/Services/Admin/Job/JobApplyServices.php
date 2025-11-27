<?php

namespace App\Http\Services\Admin\Job;

use App\Constants\BaseConstants;
use App\Http\Services\Admin\FcmService;
use App\Models\Admin;
use App\Models\Job;
use App\Models\JobApply;
use App\Models\UserDevice;
use App\Models\UserNotification;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class JobApplyServices
{
    protected FcmService $fcm;

    public function __construct(FcmService $fcm)
    {
        $this->fcm = $fcm;
    }

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
        if (!in_array($status, [
            JobApply::STATUS_PENDING,
            JobApply::STATUS_ACCEPTED,
            JobApply::STATUS_REJECTED,
            JobApply::STATUS_INTERVIEW,
            JobApply::STATUS_OFFER,
            JobApply::STATUS_HIRED,
        ], true)) {
            return 'status_error';
        }

        DB::beginTransaction();
        try {
            /** @var JobApply|null $jobApply */
            $jobApply = JobApply::with('job')->find($id);

            if (!$jobApply instanceof JobApply) {
                DB::rollBack();
                return 'no_job';
            }

            $adminCompanyId = Admin::find($adminId)?->company_id;
            if (!$adminCompanyId || $jobApply->job->company_id !== $adminCompanyId) {
                DB::rollBack();
                return 'no_role';
            }

            $jobApply->status = $status;
            $jobApply->save();

            $statusText = match ($status) {
                JobApply::STATUS_PENDING   => 'ĐANG ĐƯỢC XEM XÉT',
                JobApply::STATUS_ACCEPTED  => 'ĐÃ ĐƯỢC CHẤP NHẬN',
                JobApply::STATUS_REJECTED  => 'BỊ TỪ CHỐI',
                JobApply::STATUS_INTERVIEW => 'MỜI PHỎNG VẤN',
                JobApply::STATUS_OFFER     => 'ĐƯỢC ĐỀ NGHỊ LÀM VIỆC',
                JobApply::STATUS_HIRED     => 'ĐÃ TRÚNG TUYỂN',
                default                    => 'ĐÃ CẬP NHẬT',
            };
            $jobTitle = $jobApply->job->title ?? 'công việc';
            UserNotification::create([
                'user_id' => $jobApply->user_id,
                'title'   => 'Cập nhật trạng thái ứng tuyển',
                'body'    => "Đơn ứng tuyển vị trí {$jobTitle} của bạn đã được cập nhật thành: {$statusText}.",
                'data'    => [
                    'job_apply_id' => $jobApply->id,
                    'job_id'       => $jobApply->job_id,
                    'status'       => $status,
                    'status_text'  => $statusText,
                ],
            ]);


            $this->notifyApplicantStatusChanged($jobApply);

            DB::commit();
            return $jobApply;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }



    protected function notifyApplicantStatusChanged(JobApply $jobApply): void
    {
        $userId   = $jobApply->user_id;
        $jobTitle = $jobApply->job->title ?? 'Công việc bạn đã ứng tuyển';

        $tokens = UserDevice::where('user_id', $userId)
            ->pluck('device_token')
            ->toArray();

        if (empty($tokens)) {
            Log::info('No device tokens for user when update status', [
                'user_id' => $userId,
                'job_apply_id' => $jobApply->id,
            ]);
            return;
        }

        $statusLabel = match ($jobApply->status) {
            JobApply::STATUS_ACCEPTED   => 'Đã nhận việc',
            JobApply::STATUS_OFFER      => 'Đề nghị nhận việc',
            JobApply::STATUS_REJECTED   => 'Từ chối hồ sơ',
            JobApply::STATUS_INTERVIEW  => 'Mời phỏng vấn',
            JobApply::STATUS_PENDING    => 'Chờ duyệt',
            JobApply::STATUS_HIRED      => 'Đã tuyển dụng',
            default                     => 'Cập nhật trạng thái',
        };

        $title = 'Cập nhật trạng thái ứng tuyển';
        $body  = "{$statusLabel} - {$jobTitle}";

        $this->fcm->sendToTokens($tokens, $title, $body, [
            'type'      => 'job_apply_status',
            'status'    => (string) $jobApply->status,
            'job_id'    => (string) $jobApply->job_id,
            'job_title' => $jobTitle,
            'job_apply_id' => (string) $jobApply->id,
        ]);
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
            return (object) [
                'user'     => $application->user,
                'jobApply' => $application,
            ];
        } catch (ModelNotFoundException $e) {
            return null;
        }
    }
}
