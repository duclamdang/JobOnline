<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use App\Constants\HttpStatus;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        if ($request->expectsJson()) {
            abort(response()->json([
                'status_code' => HttpStatus::UNAUTHORIZED,
                'message'     => __('Please check your login credentials and try again.'),
            ], HttpStatus::UNAUTHORIZED));
        }

        return route('login');
    }
}
