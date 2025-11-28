<?php

namespace App\Http\Controllers\Api\User\Profile;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\User\Profile\ProfileService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    protected ProfileService $profileService;

    public function __construct(ProfileService $profileService)
    {
        $this->profileService = $profileService;
    }

    public function getProfile(Request $request)
    {
        try {
            $result = $this->profileService->getProfile($request->user());

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['data'],
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getBasicInfo(Request $request)
    {
        try {
            $data = $this->profileService->getBasicInfo($request->user());

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy thông tin cơ bản thành công',
                'data'        => $data,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getCV(Request $request)
    {
        try {
            $data = $this->profileService->getCV($request->user());

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy thông tin CV thành công',
                'data'        => $data,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getJobCriteria(Request $request)
    {
        try {
            $data = $this->profileService->getJobCriteria($request->user());

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy tiêu chí tìm việc thành công',
                'data'        => $data,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getGeneralInfo(Request $request)
    {
        try {
            $data = $this->profileService->getGeneralInfo($request->user());

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => 'Lấy thông tin chung thành công',
                'data'        => $data,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function updateBasicInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'              => 'sometimes|string|max:255',
            'birthday'          => 'nullable|date',
            'address'           => 'nullable|string|max:255',
            'gender'            => 'nullable|in:0,1',
            'bank_info'         => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE);
        }

        try {
            $result = $this->profileService->updateBasicInfo($request->user(), $validator->validated());

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
                'data'        => $result['user'],
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

    public function updateJobSearchStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_search_status' => 'required|integer|in:0,1,2',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE);
        }

        try {
            $result = $this->profileService->updateJobSearchStatus($request->user(), $validator->validated());

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
                'data'        => $result['user'],
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

    public function updateAvatar(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'avatar' => 'required|file|mimes:jpg,jpeg,png|max:10240',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $file = $request->file('avatar');
            $result = $this->profileService->updateAvatar($request->user(), $file);

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
                'data'        => $result['user'],
            ], HttpStatus::OK);

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

    public function createCV(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'cv_file' => 'required|file|mimes:pdf|max:10240'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $file = $request->file('cv_file');
            $result = $this->profileService->createCV($request->user(), $file);

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
                'data'        => $result['cv'],
            ], HttpStatus::OK);

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

    public function deleteCV(Request $request, int $id)
    {
        try {
            $result = $this->profileService->deleteCV($request->user(), $id);

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

    public function updateMainCV(Request $request, int $id)
    {
        try {
            $result = $this->profileService->updateMainCV($request->user(), $id);

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
                'data'        => $result['cv'],
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }


    public function updateJobCriteria(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'desired_position' => 'nullable|string|max:255',
            'work_field_id'    => 'nullable|integer|exists:work_fields,id',
            'province_id'      => 'nullable|integer|exists:provinces,id',
            'min_salary'       => 'nullable|integer|min:0',
            'max_salary'       => 'nullable|integer|min:0',
            'working_form_id'  => 'nullable|integer|exists:working_forms,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE);
        }

        try {
            $result = $this->profileService->updateJobCriteria($request->user(), $validator->validated());

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['user'],
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

    public function updateGeneralInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'work_experience_id' => 'nullable|integer|exists:work_experiences,id',
            'position_id'        => 'nullable|integer|exists:positions,id',
            'education_id'       => 'nullable|integer|exists:educations,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE);
        }

        try {
            $result = $this->profileService->updateGeneralInfo($request->user(), $validator->validated());

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => $result['user'],
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

    public function changePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string|min:6',
                'new_password'     => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $data   = $validator->validated();
            $result = $this->profileService->changePassword(
                $request->user(),
                $data['current_password'],
                $data['new_password']
            );

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
                'data'        => [],
            ], HttpStatus::OK);

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
}
