<?php

namespace App\Http\Controllers\Api\Admin\Candidate;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\Admin\Candidate\CandidateService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CandidateController extends Controller
{
    protected CandidateService $candidateService;

    public function __construct(CandidateService $candidateService)
    {
        $this->candidateService = $candidateService;
    }

    public function index(Request $request)
    {
        try {
            $filters = $request->only([
                'desired_position',
                'work_field_id',
                'province_id',
                'min_salary',
                'max_salary',
                'working_form_id',
                'work_experience_id',
                'position_id',
                'education_id',
            ]);

            $perPage = $request->get('per_page', 10);

            $result = $this->candidateService->filterCandidates($filters, $perPage);

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
                'data'        => $result['candidates'],
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function show(Request $request, int $id)
    {
        try {
            $result = $this->candidateService->getCandidateDetail($id);

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
                'data'        => $result['candidate'],
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
