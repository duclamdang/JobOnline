<?php

namespace App\Http\Controllers\Api\Shared;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\Shared\JobCatalogService;
use Exception;

class JobCatalogController extends Controller
{
    protected $jobCatalogService;

    public function __construct(JobCatalogService $jobCatalogService)
    {
        $this->jobCatalogService = $jobCatalogService;
    }

    public function getAllWorkingForms()
    {
        try {
            $data = $this->jobCatalogService->getAllWorkingForms();

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách hình thức làm việc thành công',
                'data'        => $data,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getAllPositions()
    {
        try {
            $data = $this->jobCatalogService->getAllPositions();

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách vị trí công việc thành công',
                'data'        => $data,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getAllLanguages()
    {
        try {
            $data = $this->jobCatalogService->getAllLanguages();

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách ngôn ngữ thành công',
                'data'        => $data,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getAllWorkExperiences()
    {
        try {
            $data = $this->jobCatalogService->getAllWorkExperiences();

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách kinh nghiệm làm việc thành công',
                'data'        => $data,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getAllEducations()
    {
        try {
            $data = $this->jobCatalogService->getAllEducations();

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách trình độ học vấn thành công',
                'data'        => $data,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getAllWorkFields()
    {
        try {
            $data = $this->jobCatalogService->getAllWorkFields();

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách lĩnh vực nghề nghiệp thành công',
                'data'        => $data,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getAllMajors()
    {
        try {
            $data = $this->jobCatalogService->getAllMajors();

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách chuyên nghành đào tạo thành công',
                'data'        => $data,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getAllIndustries()
    {
        try {
            $data = $this->jobCatalogService->getAllIndustries();

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy danh sách lĩnh vực hoạt động thành công',
                'data'        => $data,
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }
}
