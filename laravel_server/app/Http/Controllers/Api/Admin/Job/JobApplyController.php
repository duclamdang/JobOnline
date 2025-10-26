<?php

namespace App\Http\Controllers\Api\Admin\Job;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\JobApplyByIdResource;
use App\Http\Resources\Admin\JobApplyResource;
use App\Http\Resources\Admin\JobResource;
use App\Http\Resources\User\DetailApplyResource;
use App\Http\Services\Admin\Job\JobApplyServices;
use App\Models\JobApply;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobApplyController extends Controller
{
    protected JobApplyServices $jobApplyServices;

    public function __construct(JobApplyServices $jobApplyServices)
    {
        $this->jobApplyServices = $jobApplyServices;
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
        return response()->json([
            'message' => 'Cập nhật status Job Apply thành công',
            'status' => $status
        ], HttpStatus::OK);
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
