<?php

namespace App\Http\Controllers\Api\Admin\Employer;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\Admin\Employer\EmployerService;
use Illuminate\Http\Request;
use Exception;

class EmployerController extends Controller
{
    protected EmployerService $employerService;

    public function __construct(EmployerService $employerService)
    {
        $this->employerService = $employerService;
    }
    public function getAll(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $result = $this->employerService->getAll($perPage);

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::NOT_FOUND,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::NOT_FOUND);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['employers'],
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }
    public function getById(int $id)
    {
        try {
            $result = $this->employerService->getById($id);

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::NOT_FOUND,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::NOT_FOUND);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['employer'],
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function active(Request $request, int $id)
    {
        try {
            $result = $this->employerService->active($request, $id);

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::BAD_REQUEST,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::BAD_REQUEST);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
            ], HttpStatus::OK);
        } catch (\Exception $e) {
            return response()->json([
                'status_code' => HttpStatus::INTERNAL_ERROR,
                'message'     => 'Lỗi hệ thống: ' . $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }
}
