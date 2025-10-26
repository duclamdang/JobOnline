<?php

namespace App\Http\Controllers\Api\User\Auth;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Services\User\Auth\AuthService;
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
                'name'              => 'required|string|max:255',
                'email'             => 'nullable|email',
                'phone'             => 'nullable|string|max:20',
                'password'          => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $data = $validator->validated();

            if (empty($data['email']) && empty($data['phone'])) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => 'Bạn phải nhập email hoặc số điện thoại',
                ], HttpStatus::UNPROCESSABLE);
            }

            $emailExists = !empty($data['email']) && $this->authService->checkEmailExists($data['email']);
            $phoneExists = !empty($data['phone']) && $this->authService->checkPhoneExists($data['phone']);

            $errorMessages = '';
            if ($emailExists && $phoneExists) {
                $errorMessages = 'Email và số điện thoại đã tồn tại trong hệ thống';
            } elseif ($emailExists) {
                $errorMessages = 'Email đã tồn tại trong hệ thống';
            } elseif ($phoneExists) {
                $errorMessages = 'Số điện thoại đã tồn tại trong hệ thống';
            }

            if ($errorMessages !== '') {
                return response()->json([
                    'status_code'    => HttpStatus::UNAUTHORIZED,
                    'data'           => [],
                    'error_messages' => $errorMessages,
                ], HttpStatus::UNAUTHORIZED);
            }

            $result = $this->authService->register($data);

            return response()->json([
                'status_code' => HttpStatus::CREATED,
                'message'     => $result['message'],
                'data'        => [
                    'user' => $result['user'],
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
                'account'  => 'required|string',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $result = $this->authService->login($request->account, $request->password);

            if (!$result['success']) {
                return response()->json([
                    'status_code'    => HttpStatus::UNAUTHORIZED,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::UNAUTHORIZED);
            }

            $cookie = cookie(
                'user_refresh_token',
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
                    'user'        => $result['user'],
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

    public function checkAccount(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'account' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $validator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }

            $account = $validator->validated()['account'];

            if (filter_var($account, FILTER_VALIDATE_EMAIL)) {
                $exists = $this->authService->checkEmailExists($account);
            } else {
                $exists = $this->authService->checkPhoneExists($account);
            }

            return response()->json([
                'status_code' => HttpStatus::OK,
                'message'     => $exists
                    ? 'Tài khoản đã tồn tại trong hệ thống'
                    : 'Tài khoản chưa tồn tại trong hệ thống',
                'data'        => [
                    'exists' => $exists,
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

    public function logout(Request $request)
    {
        try {
            $refreshToken = $request->cookie('user_refresh_token');

            $result = $this->authService->logout($refreshToken);

            $cookie = cookie()->forget('user_refresh_token');

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
            $refreshToken = $request->cookie('user_refresh_token');

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
                    'user'        => $result['user'],
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
                    'data'        => [],
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

    public function resetPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token'    => 'required',
                'email' => 'required|email',
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
                    'status_code'    => HttpStatus::BAD_REQUEST,
                    'data'           => [],
                    'error_messages' => $result['message'],
                ], HttpStatus::BAD_REQUEST);
            }

            return response()->json([
                'status_code'    => HttpStatus::OK,
                'message' => $result['message'],
                'data'           => [],
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
