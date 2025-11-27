<?php

namespace App\Http\Controllers\Api\Admin\Job;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\JobApplyResource;
use App\Http\Resources\Admin\JobResource;
use App\Http\Resources\User\DetailApplyResource;
use App\Http\Services\Admin\FcmService;
use App\Http\Services\Admin\Job\JobApplyServices;
use App\Models\JobApply;
use App\Models\UserDevice;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JobApplyController extends Controller
{
    protected JobApplyServices $jobApplyServices;
    protected FcmService $fcm;
    public function __construct(JobApplyServices $jobApplyServices, FcmService $fcm)
    {
        $this->jobApplyServices = $jobApplyServices;
        $this->fcm = $fcm;
    }

    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);
        $jobApplies = $this->jobApplyServices->getAllJobApplyByAdmin($request, $perPage);
        return JobApplyResource::collection($jobApplies)
        ->additional([
            'status_code' => HttpStatus::OK,
            'message' => 'Danh sách ứng viên',
        ]);
    }

    public function show(Request $request, $id)
    {
        $companyId = $request->user()->company_id;
        $jobApply = $this->jobApplyServices->getJobApplyById($id, $companyId);
        if ($jobApply) {
            return response()->json([
                'message' => 'Đã ứng tuyển thành công',
                'status_code' => HttpStatus::OK
            ], HttpStatus::OK);
        } else {
            return response()->json([
                'message' => 'Chưa ứng tuyển',
                'status_code' => HttpStatus::NOT_FOUND
            ], HttpStatus::NOT_FOUND);
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $adminId = $request->user()->id;
        $status =$request->input('status');
        $updated = $this->jobApplyServices->updateStatus($id, $adminId, $status);
        if ($updated === 'status_error') {
            return response()->json([
                'message' => 'Trạng thái không hợp lệ',
                'status_code' => HttpStatus::BAD_REQUEST
            ], HttpStatus::BAD_REQUEST);
        }
        if ($updated === 'no_job') {
            return response()->json([
                'message' => 'Không tìm thấy Job này',
                'status_code' => HttpStatus::NOT_FOUND
            ], HttpStatus::NOT_FOUND);
        }
        if ($updated === 'no_role') {
            return response()->json([
                'message' => 'Không có quyền thay đổi status Job Apply này',
                'status_code' => HttpStatus::FORBIDDEN
            ], HttpStatus::FORBIDDEN);
        }
        try {
            // Giả sử $updated là model JobApply
            $this->notifyApplicantStatusChanged($updated, $status);
        } catch (\Throwable $e) {
            Log::error('Send FCM error when update job apply status', [
                'error'    => $e->getMessage(),
                'apply_id' => $id,
            ]);
        }
        return response()->json([
            'message' => 'Cập nhật status Job Apply thành công',
            'status' => $status
        ], HttpStatus::OK);
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
                'user_id'      => $userId,
                'job_apply_id' => $jobApply->id,
            ]);
            return;
        }

        $statusCode = $jobApply->status;

        // 🔁 map từ mã số (0..5) sang text đẹp
        $statusText = match ($statusCode) {
            JobApply::STATUS_ACCEPTED   => 'ĐÃ ĐƯỢC CHẤP NHẬN',
            JobApply::STATUS_REJECTED   => 'BỊ TỪ CHỐI',
            JobApply::STATUS_INTERVIEW  => 'MỜI PHỎNG VẤN',
            JobApply::STATUS_OFFER      => 'ĐỀ NGHỊ NHẬN VIỆC',
            JobApply::STATUS_HIRED      => 'ĐÃ TUYỂN',
            JobApply::STATUS_PENDING    => 'ĐANG ĐƯỢC XEM XÉT',
            default                     => 'ĐÃ CẬP NHẬT',
        };

        $title = 'Cập nhật trạng thái ứng tuyển';
        $body  = "Đơn ứng tuyển vị trí {$jobTitle} của bạn đã được cập nhật thành: {$statusText}.";

        $this->fcm->sendToTokens($tokens, $title, $body, [
            'type'         => 'job_apply_status',
            'status'       => (string) $statusCode,   // mã số nếu Flutter cần
            'status_text'  => $statusText,           // text cho đẹp
            'job_id'       => (string) $jobApply->job_id,
            'job_title'    => $jobTitle,
            'job_apply_id' => (string) $jobApply->id,
        ]);
    }

    /**
     * Hàm gửi FCM chung
     */
    protected function sendFcm(array $tokens, string $title, string $body, array $data = []): void
    {
        // Lấy server key từ config/services.php
        $serverKey = config('services.fcm.server_key');
        if (empty($serverKey)) {
            Log::warning('FCM server key is not configured');
            return;
        }

        $payload = [
            'registration_ids' => $tokens,
            'notification'     => [
                'title' => $title,
                'body'  => $body,
            ],
            'data'             => $data,
            'android'          => [
                'priority' => 'high',
            ],
        ];

        $response = Http::withHeaders([
            'Authorization' => 'key=' . $serverKey,
            'Content-Type'  => 'application/json',
        ])->post('https://fcm.googleapis.com/fcm/send', $payload);

        if ($response->failed()) {
            Log::error('Send FCM failed', [
                'response' => $response->body(),
            ]);
        }
    }
    public function getApplicantByJob(Request $request, $jobId){
        $adminId = $request->user()->id;
        $perPage = $request->query('per_page', 10);
        $applicants = $this->jobApplyServices->getApplicantByJob($jobId, $adminId, $perPage);
        if (!$applicants) {
            return response()->json([
                'message' => 'Không tìm thấy job',
                'status_code' => HttpStatus::FORBIDDEN
            ], HttpStatus::FORBIDDEN);
        }
        return JobApplyResource::collection($applicants);
    }

    public function getCandidateDetail($id)
    {
        $user = $this->jobApplyServices->getCandidateDetail($id);

        if (!$user) {
            return response()->json([
                'status_code' => HttpStatus::NOT_FOUND,
                'message' => 'Không tìm thấy đơn ứng tuyển',
            ], HttpStatus::NOT_FOUND);
        }

        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Chi tiết ứng viên.',
            'data' => new DetailApplyResource($user),
        ], HttpStatus::OK);
    }

}
