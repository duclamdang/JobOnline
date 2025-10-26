<?php

namespace App\Http\Controllers\Api\User\Job;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\JobResource;
use App\Http\Services\User\Job\JobServices;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;

class JobController extends Controller
{
    protected JobServices $jobServices;
    public function __construct(JobServices $jobServices)
    {
        $this->jobServices = $jobServices;
    }
    public function search(Request $request)
    {
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
        $jobs = $this->jobServices->getByConditions($params);
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

        $jobs = $this->jobServices->getUrgentJobs($conditions, $perPage);

        return $jobs;
    }
    public function getImmediatelyJobs(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $conditions = $request->only(['work_field_id']);
        $jobs = $this->jobServices->getImmediatelyJobs($conditions, $perPage);
        return $jobs;
    }
    public function getJobCountsByWorkField()
    {
        $counts = $this->jobServices->getJobCountsByWorkField();
        return $counts;
    }
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $jobs = $this->jobServices->getAllJob($perPage);
        return $jobs;
    }
    public function getJobByCompany(Request $request, int $companyId)
    {
        $perPage = $request->input('per_page', 10);
        $jobs = $this->jobServices->getJobByCompany($companyId, $perPage);
        return $jobs;
    }
    public function show($id)
    {
        try {
            $job = $this->jobServices->getJobById($id);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status_code' => HttpStatus::NOT_FOUND,
                'message' => 'Không tìm thấy công việc',
            ], HttpStatus::NOT_FOUND);
        }catch (\Exception $e) {
            return response()->json([
                'status_code' => HttpStatus::BAD_REQUEST,
                'message' => $e->getMessage(),
            ], HttpStatus::BAD_REQUEST);
        }

        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Chi tiết công việc',
            'data' => $job,
        ], HttpStatus::OK);
    }
}
