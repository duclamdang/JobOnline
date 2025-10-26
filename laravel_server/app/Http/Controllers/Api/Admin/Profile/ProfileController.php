<?php

namespace App\Http\Controllers\Api\Admin\Profile;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\Admin\Profile\ProfileService;
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
                'data'        => [
                    'admin' => $result['admin'],
                ],
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $validator = Validator::make($request->all() + ['avatar' => $request->file('avatar')], [
                'name'    => 'sometimes|string|max:255',
                'phone'   => 'nullable|string|max:20|unique:admins,phone,' . $request->user()->id,
                'address' => 'nullable|string|max:255',
                'avatar'  => 'nullable|file|mimes:jpg,jpeg,png|max:10240',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $result = $this->profileService->updateProfile($request->user(), $validator->validated());

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => [
                    'admin' => $result['admin'],
                ],
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
