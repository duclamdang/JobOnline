<?php

namespace App\Http\Controllers\Api\User\Profile;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\User\Profile\UserProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Exception;

class UserProjectController extends Controller
{
    protected $projectService;

    public function __construct(UserProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    public function index(Request $request)
    {
        try {
            $result = $this->projectService->getAll($request->user());

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['projects'],
            ]);
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
            $result = $this->projectService->getById($request->user(), $id);

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
                'data'        => $result['project'],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'       => 'required|string',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'description'=> 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE);
        }

        try {
            $result = $this->projectService->create($request->user(), $validator->validated());

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['project'],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $e->errors(),
            ], HttpStatus::UNPROCESSABLE);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function update(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'name'       => 'sometimes|string',
            'start_date' => 'sometimes|date',
            'end_date'   => 'sometimes|date|after_or_equal:start_date',
            'description'=> 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE);
        }

        try {
            $result = $this->projectService->update($request->user(), $id, $validator->validated());

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
                'data'        => $result['project'],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $e->errors(),
            ], HttpStatus::UNPROCESSABLE);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function destroy(Request $request, int $id)
    {
        try {
            $result = $this->projectService->delete($request->user(), $id);

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
                'data'        => [],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }
}
