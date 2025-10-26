<?php

namespace App\Http\Controllers\Api\Admin\Job;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateJobRequest;
use App\Http\Resources\Admin\JobResource;
use App\Http\Services\Admin\Job\JobService;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use App\Http\Requests\JobRequest;

class JobController extends Controller
{
    protected JobService $jobService;

    public function __construct(JobService $jobService)
    {
        $this->jobService = $jobService;
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page');
        $admin = $request->user();
        $companyId = $admin->company_id;
        $jobs = $this->jobService->getAllJob($companyId, $perPage);
        return $jobs;
    }


    public function show($id, Request $request)
    {
        $admin = $request->user();
        $companyId = $admin->company_id;
        try {
            $job = $this->jobService->getJobById($companyId, $id);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status_code' => HttpStatus::NOT_FOUND,
                'message' => 'Không tìm thấy công việc',
            ], HttpStatus::NOT_FOUND);
        }

        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Chi tiết công việc',
            'data' => $job,
        ], HttpStatus::OK);
    }

    public function store(JobRequest $request)
    {
        $data = $request->validated();
        $data['company_id'] = $request->user()->company_id;
        $data['create_by'] = $request->user()->id;
        $job = $this->jobService->createJob($data);
        return response()->json([
            'status_code' => HttpStatus::CREATED,
            'message' => 'Tạo job thành công',
            'data'           => $job,
        ], HttpStatus::CREATED);
    }

    public function update(UpdateJobRequest  $request, $id)
    {
        $data = $request->validated();
        $user = $request->user();

        try {
           $updatedJob = $this->jobService->updateJob($id, $data, $user);

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message' => 'Cập nhật job thành công',
                'data' => $updatedJob,
            ], HttpStatus::OK);

        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status_code' => HttpStatus::NOT_FOUND,
                'message' => 'Không tìm thấy công việc.'
            ], HttpStatus::NOT_FOUND);
        }
    }

    public function search(Request $request)
    {
        $admin = $request->user();
        $companyId = $admin->company_id;
        $params = $request->all([
            'keyword',
            'fields',
            'location',
            'salary',
            'experience',
            'position',
            'education',
            'working_form',
            'gender'
        ]);
        $jobs = $this->jobService->getByConditions($params, $companyId);
        return response()->json([
            'status_code' => HttpStatus::OK,
            'message'     => 'Danh sách công việc',
            'data'        => JobResource::collection($jobs),
            'pagination'  => [
                'total'        => $jobs->total(),
                'per_page'     => $jobs->perPage(),
                'current_page' => $jobs->currentPage(),
                'last_page'    => $jobs->lastPage(),
            ],
        ]);
    }

    public function getUrgentJobs(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $conditions = $request->only(['work_field_id']);

        $jobs = $this->jobService->getUrgentJobs($conditions, $perPage);

        return $jobs;
    }

    public function getImmediatelyJobs(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $conditions = $request->only(['work_field_id']);
        $jobs = $this->jobService->getImmediatelyJobs($conditions, $perPage);
        return $jobs;
    }

    public function getJobCountsByWorkField()
    {
        $counts = $this->jobService->getJobCountsByWorkField();
        return $counts;
    }


//    public function destroy($id)
//    {
//        $job = Job::find($id);
//
//        if (!$job) {
//            return response()->json([
//                'message' => 'Không tìm thấy Job'
//            ],HttpStatus::NOT_FOUND);
//        }
//
//        $job->delete();
//
//        return response()->json([
//            'message' => 'Đã xoá Job thành công',
//            'deleted_id' => $id
//        ], HttpStatus::OK);
//    }
}
