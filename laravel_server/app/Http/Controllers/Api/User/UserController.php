<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function hello(): JsonResponse
    {
        return response()->json(['message' => 'Hello User from Backend!']);
    }
}
