<?php

namespace App\Http\Services\Admin\Auth;

use App\Constants\BaseConstants;
use App\Models\Admin;
use App\Models\Company;
use App\Models\RefreshToken;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Tymon\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;

class AuthService
{
    public function checkEmailExists(string $email): bool
    {
        return Admin::where('email', $email)->exists();
    }

    public function register(array $data)
    {
        $company = Company::firstOrCreate(
            ['tax_code' => $data['tax_code']],
            [
                'name'        => $data['company_name'],
                'location_id' => $data['location_id'] ?? null,
                'industry_id' => $data['industry_id'] ?? null,
                'slug'        => Str::slug($data['company_name']),
            ]
        );

        $admin = Admin::create([
            'name'       => $data['name'],
            'email'      => $data['email'],
            'password'   => Hash::make($data['password']),
            'phone'      => $data['phone'] ?? null,
            'role_id'    => $company->wasRecentlyCreated
                ? BaseConstants::EMPLOYER_ADMIN
                : BaseConstants::EMPLOYER_VIEWER,
            'company_id' => $company->id,
        ]);

        return [
            'success'      => true,
            'message'      => $company->wasRecentlyCreated
                ? 'Đăng ký thành công và công ty mới đã được tạo!'
                : 'Đăng ký thành công, bạn đã được thêm vào công ty!',
            'admin'        => $admin,
            'company'      => $company,
        ];
    }

    public function login($email, $password)
    {
        $admin = Admin::where('email', $email)->first();

        if (!$admin) {
            return [
                'success' => false,
                'message' => 'Tài khoản không chính xác! Vui lòng kiểm tra lại!',
            ];
        }

        if (!Hash::check($password, $admin->password)) {
            return [
                'success' => false,
                'message' => 'Mật khẩu không chính xác! Vui lòng kiểm tra lại!',
            ];
        }

        if (!$admin->is_active) {
            return [
                'success' => false,
                'message' => 'Tài khoản quản trị đã bị vô hiệu hóa. Vui lòng liên hệ hệ thống.',
            ];
        }

        $accessToken = auth('admin')->login($admin);

        $rawRefreshToken = Str::random(64);
        $hashedRefreshToken = hash('sha256', $rawRefreshToken);

        $admin->refreshTokens()->create([
            'token_hash' => $hashedRefreshToken,
            'expires_at' => Carbon::now()->addDays(7),
        ]);

        return [
            'success'       => true,
            'message'       => 'Đăng nhập tài khoản Admin thành công!',
            'admin'         => $admin,
            'access_token'  => $accessToken,
            'expires_in'    => auth('admin')->factory()->getTTL() * 60,
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

        auth('admin')->logout();

        return [
            'success' => true,
            'message' => 'Đăng xuất tài khoản Admin thành công',
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

        $admin = $tokenRecord->owner;

        $newAccessToken = JWTAuth::fromUser($admin);

        return [
            'success'      => true,
            'message'      => 'Token đã được refresh thành công',
            'admin'        => $admin,
            'access_token' => $newAccessToken,
            'expires_in'   => auth('admin')->factory()->getTTL() * 60,
        ];
    }

    public function sendResetLink($email)
    {
        $status = Password::broker('admins')->sendResetLink(['email' => $email]);

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
        $status = Password::broker('admins')->reset(
            $data,
            function ($admin, $password) {
                $admin->password = Hash::make($password);
                $admin->save();
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
