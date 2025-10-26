<?php

namespace App\Http\Middleware;

use App\Constants\BaseConstants;
use App\Constants\HttpStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user();

        if (!$admin || $admin->role_id == BaseConstants::EMPLOYER_VIEWER) {
            return response()->json([
                'message' => 'Tài khoản không có quyền quản lý tin tuyển dụng và ứng viên.'
            ], HttpStatus::FORBIDDEN);
        }

        return $next($request);
    }
}
