<?php

namespace App\Http\Controllers\Api\User\Job;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\JobApplyResource;
use App\Http\Resources\User\JobResource;
use App\Http\Services\User\Job\JobApplyServices;
use App\Mail\NewApplicationMail;
use App\Models\Job;
use App\Models\JobApply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class JobApplyController extends Controller
{
    protected JobApplyServices $jobApplyServices;
    public function __construct(JobApplyServices $jobApplyServices)
    {
        $this->jobApplyServices = $jobApplyServices;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'job_id' => 'required|integer',
            'cv_id'  => 'required|integer',
        ]);
        $apply = $this->jobApplyServices->apply($request, $data);
        if ($apply === 'invalid_cv') {
            return response()->json([
                'success'     => false,
                'status_code' => HttpStatus::FORBIDDEN,
                'message'     => 'Không có quyền sử dụng CV này.',
            ], HttpStatus::FORBIDDEN);
        }
        if ($apply === 'already_applied') {
            return response()->json([
                'success'     => false,
                'status_code' => HttpStatus::BAD_REQUEST,
                'message'     => 'Bạn đã ứng tuyển công việc này trước đó.',
            ], HttpStatus::CONFLICT);
        }
        $user = $request->user();
        $job  = Job::with('creator')->findOrFail($data['job_id']);
        $receiverEmail = $job->creator && $job->creator->email
            ? $job->creator->email
            : config('mail.admin_address');

        if ($receiverEmail) {
            try {
                Mail::to($receiverEmail)->send(new NewApplicationMail($user, $job));
            } catch (\Throwable $e) {
                Log::error('SEND MAIL APPLY FAIL', [
                    'job_id' => $job->id ?? null,
                    'error'  => $e->getMessage(),
                ]);
            }
        }
        return response()->json([
            'success'     => true,
            'status_code' => HttpStatus::CREATED,
            'message'     => 'Ứng tuyển thành công',
        ], HttpStatus::CREATED);
    }
    public function index(Request $request)
    {
        $job_applies = $this->jobApplyServices->getAllJobApplyByUser($request);
        return JobApplyResource::collection($job_applies)
            ->additional([
                'success'     => true,
                'status_code' => HttpStatus::OK,
                'message' => 'Danh sách các công việc đã ứng tuyển của bạn',
            ]);
    }
}
