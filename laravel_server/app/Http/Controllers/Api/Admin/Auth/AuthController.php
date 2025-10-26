<?php

namespace App\Http\Controllers\Api\Admin\Auth;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\Admin\Auth\AuthService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name'         => 'required|string|max:255',
                'email'        => 'required|email',
                'password'     => 'required|string|min:6|confirmed',
                'tax_code'     => 'required|string|max:255',
                'company_name' => 'required|string|max:255',
                'location_id'  => 'nullable|exists:provinces,id',
                'industry_id'  => 'nullable|exists:industries,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $data = $validator->validated();
            if ($this->authService->checkEmailExists($data['email'])) {
                return response()->json([
                    'status_code'    => HttpStatus::UNAUTHORIZED,
                    'data'           => [],
                    'error_messages' => 'Email đã tồn tại trong hệ thống',
                ], HttpStatus::UNAUTHORIZED);
            }

            $result = $this->authService->register($data);

            return response()->json([
                'status_code' => HttpStatus::CREATED,
                'message'     => $result['message'],
                'data'        => [
                    'admin'        => $result['admin'],
                    'company'      => $result['company'],
                ],
            ], HttpStatus::CREATED);

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

    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email'    => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $result = $this->authService->login($request->email, $request->password);

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::UNAUTHORIZED,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::UNAUTHORIZED);
            }


            $cookie = cookie(
                'admin_refresh_token',
                $result['refresh_token'],
                60 * 24 * 7,
                '/',
                null,
                false,
                true,
                false,
                'Strict'
            );

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => [
                    'admin'        => $result['admin'],
                    'access_token' => $result['access_token'],
                    'expires_in'   => $result['expires_in'],
                ],
            ], HttpStatus::OK)->cookie($cookie);


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

    public function logout(Request $request)
    {
        try {
            $refreshToken = $request->cookie('admin_refresh_token');

            $result = $this->authService->logout($refreshToken);

            $cookie = cookie()->forget('admin_refresh_token');

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => [],
            ], HttpStatus::OK)->cookie($cookie);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function refreshToken(Request $request)
    {
        try {
            $refreshToken = $request->cookie('admin_refresh_token');

            $result = $this->authService->refreshToken($refreshToken);

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::UNAUTHORIZED,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::UNAUTHORIZED);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $result['message'],
                'data'        => [
                    'admin'        => $result['admin'],
                    'access_token' => $result['access_token'],
                    'expires_in'   => $result['expires_in'],
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


    public function forgotPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), ['email' => 'required|email']);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $data = $validator->validated();
            if (!$this->authService->checkEmailExists($data['email'])) {
                return response()->json([
                    'status_code'    => HttpStatus::UNAUTHORIZED,
                    'data'           => [],
                    'error_messages' => 'Email không tồn tại trong hệ thống',
                ], HttpStatus::UNAUTHORIZED);
            }

            $result = $this->authService->sendResetLink($data['email']);

            if (!$result['success']) {
                return response()->json([
                    'status_code' => HttpStatus::BAD_REQUEST,
                    'message'     => $result['message'],
                    'data'        => [],
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

    public function resetPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token'    => 'required',
                'email'    => 'required|email',
                'password' => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $data = $validator->validated();
            if (!$this->authService->checkEmailExists($data['email'])) {
                return response()->json([
                    'status_code'    => HttpStatus::UNAUTHORIZED,
                    'data'           => [],
                    'error_messages' => 'Email không tồn tại trong hệ thống',
                ], HttpStatus::UNAUTHORIZED);
            }

            $result = $this->authService->resetPassword($request->only(
                'email', 'password', 'password_confirmation', 'token'
            ));

            if (!$result['success']) {
                return response()->json([
                    'status_code' => HttpStatus::BAD_REQUEST,
                    'message'     => $result['message'],
                    'data'        => [],
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
