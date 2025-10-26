<?php

namespace App\Http\Services\User\Auth;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthService
{
    public function checkEmailExists(string $email): bool
    {
        return User::where('email', $email)->exists();
    }

    public function checkPhoneExists(string $phone): bool
    {
        return User::where('phone', $phone)->exists();
    }

    public function register(array $data)
    {
        $user = User::create([
            'name'              => $data['name'],
            'email'             => $data['email'] ?? null,
            'phone'             => $data['phone'] ?? null,
            'password'          => Hash::make($data['password']),
        ]);

        return [
            'success' => true,
            'message' => 'Đăng ký tài khoản thành công!',
            'user'    => $user,
        ];
    }

    public function login($account, $password)
    {
        $user = filter_var($account, FILTER_VALIDATE_EMAIL)
            ? User::where('email', $account)->first()
            : User::where('phone', $account)->first();

        if (!$user) {
            return [
                'success' => false,
                'message' => 'Tài khoản không chính xác! Vui lòng kiểm tra lại!',
            ];
        }

        if (!Hash::check($password, $user->password)) {
            return [
                'success' => false,
                'message' => 'Mật khẩu không chính xác! Vui lòng kiểm tra lại!',
            ];
        }

        if (!$user->isActive()) {
            return [
                'success' => false,
                'message' => 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ hỗ trợ.',
            ];
        }

        $accessToken = auth('user')->login($user);

        $rawRefreshToken = Str::random(64);
        $hashedRefreshToken = hash('sha256', $rawRefreshToken);

        $user->refreshTokens()->create([
            'token_hash' => $hashedRefreshToken,
            'expires_at' => Carbon::now()->addDays(7),
        ]);

        return [
            'success'       => true,
            'message'       => 'Đăng nhập tài khoản User thành công!',
            'user'          => $user,
            'access_token'  => $accessToken,
            'expires_in'    => auth('user')->factory()->getTTL() * 60,
            'refresh_token' => $rawRefreshToken,
        ];
    }

    public function logout($refreshToken)
    {
        if (!$refreshToken) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy refresh token',
            ];
        }

        $hashed = hash('sha256', $refreshToken);

        RefreshToken::where('token_hash', $hashed)
            ->where('revoked', false)
            ->update(['revoked' => true]);

        auth('user')->logout();

        return [
            'success' => true,
            'message' => 'Đăng xuất tài khoản User thành công',
        ];
    }

    public function refreshToken($refreshToken)
    {
        if (!$refreshToken) {
            return [
                'success' => false,
                'message' => 'Không tìm thấy refresh token',
            ];
        }

        $hashed = hash('sha256', $refreshToken);

        $tokenRecord = RefreshToken::where('token_hash', $hashed)
            ->where('revoked', false)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        if (!$tokenRecord) {
            return [
                'success' => false,
                'message' => 'Refresh token không hợp lệ hoặc đã hết hạn',
            ];
        }

        $user = $tokenRecord->owner;

        $newAccessToken = JWTAuth::fromUser($user);

        return [
            'success'       => true,
            'message'       => 'Token đã được refresh thành công',
            'user'          => $user,
            'access_token'  => $newAccessToken,
            'expires_in'    => auth('user')->factory()->getTTL() * 60,
        ];
    }

    public function sendResetLink($email)
    {
        $status = Password::broker('users')->sendResetLink(['email' => $email]);

        if ($status === Password::RESET_LINK_SENT) {
            return [
                'success' => true,
                'message' => 'Link reset mật khẩu đã được gửi vào email',
            ];
        }

        return [
            'success' => false,
            'message' => 'Không thể gửi link reset mật khẩu',
        ];
    }

    public function resetPassword(array $data)
    {
        $status = Password::broker('users')->reset(
            $data,
            function ($user, $password) {
                $user->password = Hash::make($password);
                $user->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return [
                'success' => true,
                'message' => 'Mật khẩu đã được đặt lại thành công',
            ];
        }

        return [
            'success' => false,
            'message' => 'Token không hợp lệ hoặc đã hết hạn',
        ];
    }
}
