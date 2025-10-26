<?php

namespace App\Http\Middleware;

use App\Constants\BaseConstants;
use App\Constants\HttpStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRootRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = $request->user('admin');

        if (!$admin || is_null($admin->role_id)) {
            return response()->json([
                'status_code'    => HttpStatus::FORBIDDEN,
                'error_messages' => 'Không tìm thấy thông tin quyền.',
            ], HttpStatus::FORBIDDEN);
        }

        if ($admin->role_id !== BaseConstants::ROOT_ADMIN) {
            return response()->json([
                'status_code'    => HttpStatus::FORBIDDEN,
                'error_messages' => 'Bạn không có quyền thực hiện thao tác này.',
            ], HttpStatus::FORBIDDEN);
        }

        return $next($request);
    }
}
