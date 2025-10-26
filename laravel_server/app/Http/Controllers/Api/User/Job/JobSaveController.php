<?php

namespace App\Http\Controllers\Api\User\Job;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\JobResource;
use App\Http\Services\User\Job\JobSaveServices;
use App\Models\JobApply;
use App\Models\JobSaved;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobSaveController extends Controller
{
    protected JobSaveServices $jobSaveServices;
    public function __construct(JobSaveServices $jobSaveServices)
    {
        $this->jobSaveServices = $jobSaveServices;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'job_id' => 'required|integer',
        ]);

        $saved = $this->jobSaveServices->saved($request, $data);

        if (!$saved) {
            return response()->json([
                'status_code' => HttpStatus::CONFLICT,
                'message'     => 'Bạn đã lưu công việc này rồi.',
            ], HttpStatus::CONFLICT);
        }

        return response()->json([
            'status_code' => HttpStatus::CREATED,
            'message'     => 'Lưu công việc thành công',
        ], HttpStatus::CREATED);
    }

    public function index(Request $request)
    {
        $saved_jobs = $this->jobSaveServices->getAllJobSavedByUser($request);
        return JobResource::collection($saved_jobs)
            ->additional([
                'status_code' => HttpStatus::OK,
                'message' => 'Danh sách công việc đã lưu của bạn',
            ]);
    }

    public function destroy(Request $request, int $jobId)
    {
        $deleted = $this->jobSaveServices->deleteJobSaved($request, $jobId);

        if ($deleted === 'not_found') {
            return response()->json([
                'status_code' => HttpStatus::NOT_FOUND,
                'message' => 'Không tìm thấy công việc đã lưu'
            ], HttpStatus::NOT_FOUND);
        }

        if ($deleted === 'forbidden') {
            return response()->json([
                'status_code' => HttpStatus::FORBIDDEN,
                'message' => 'Không có quyền huỷ lưu công việc này'
            ], HttpStatus::FORBIDDEN);
        }

        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Huỷ lưu công việc thành công',
            'deleted_id' => $deleted,
        ], HttpStatus::OK);
    }
}
