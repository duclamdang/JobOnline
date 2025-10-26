<?php

namespace App\Http\Controllers\Api\Admin\Dashboard;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\Admin\Dashboard\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardServices)
    {
        $this->dashboardService = $dashboardServices;
    }

    public function getTotalJobs(){
        $count = $this->dashboardService->getTotalJobs();
        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Số lượng công việc ',
            'data' => $count,
        ], HttpStatus::OK);
    }
    public function getTotalUsers(){
        $count = $this->dashboardService->getTotalUsers();
        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Số lượng ứng viên ',
            'data' => $count,
        ], HttpStatus::OK);
    }
    public function getTotalCompanies(){
        $count = $this->dashboardService->getTotalCompanies();
        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Số lượng công ty ',
            'data' => $count,
        ], HttpStatus::OK);
    }

    public function getNewJobsWeek(){
        $count = $this->dashboardService->getNewJobsWeek();
        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Số lượng công việc mới theo tuần',
            'data' => $count,
        ], HttpStatus::OK);
    }
    public function getNewJobsMonth(){
        $count = $this->dashboardService->getNewJobsMonth();
        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Số lượng công việc mới theo tháng',
            'data' => $count,
        ], HttpStatus::OK);
    }

    public function getJobsPerMonth()
    {
        $data = $this->dashboardService->getJobsPerMonth();
        return response()->json([
            'success' => true,
            'labels' => $data['labels'],
            'data' => $data['data']
        ], 200);
    }

    public function getApplicantsPerWeek()
    {
        $data = $this->dashboardService->getApplicantsPerWeek();
        return response()->json([
            'success' => true,
            'labels' => $data['labels'],
            'data' => $data['data']
        ], 200);
    }

    public function getTopCompanies()
    {
        $companies = $this->dashboardService->getTopCompanies();
        return response()->json([
            'success' => true,
            'data' => $companies
        ], 200);
    }

    public function getEmployerJobs(Request $request){
        $count = $this->dashboardService->getEmployerJobs($request);
        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Số lượng công việc ',
            'data' => $count,
        ], HttpStatus::OK);
    }

    public function getEmployerNewJobsWeek(Request $request){
        $count = $this->dashboardService->getEmployerNewJobsWeek($request);
        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Số lượng công việc mới theo tuần',
            'data' => $count,
        ], HttpStatus::OK);
    }

    public function getEmployerNewJobsMonth(Request $request){
        $count = $this->dashboardService->getEmployerNewJobsMonth($request);
        return response()->json([
            'status_code' => HttpStatus::OK,
            'message' => 'Số lượng công việc mới theo tháng',
            'data' => $count,
        ], HttpStatus::OK);
    }

    public function getEmployerApplicantsPerWeek(Request $request)
    {
        $data = $this->dashboardService->getEmployerApplicantsPerWeek($request);
        return response()->json([
            'success' => true,
            'labels' => $data['labels'],
            'data' => $data['data']
        ], 200);
    }
}
