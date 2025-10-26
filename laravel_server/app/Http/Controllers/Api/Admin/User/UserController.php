<?php

namespace App\Http\Controllers\Api\Admin\User;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\UserResource;
use App\Http\Services\Admin\User\UserService;
use App\Models\User;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function getAll(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 10);
            $result = $this->userService->getAll($perPage);

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
                'data'        => $result['users'],
            ], HttpStatus::OK);

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function getById(int $id)
    {
        try {
            $result = $this->userService->getById($id);

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

        } catch (Exception $e) {
            return response()->json([
                'status_code'    => HttpStatus::INTERNAL_ERROR,
                'data'           => [],
                'error_messages' => $e->getMessage(),
            ], HttpStatus::INTERNAL_ERROR);
        }
    }

    public function buyContact(Request $request, User $user)
    {
        $admin = $request->user();
        $result = $this->userService->buyContact($admin, $user);
        $status = $result['success'] ? HttpStatus::OK : HttpStatus::FORBIDDEN;
        return response()->json($result, $status);
    }

    public function getUsers(Request $request)
    {
        $users = $this->userService->getUsers();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users)
        ]);
    }

    public function points(Request $request)
    {
        $admin = $request->user();
        $points = $this->userService->getPoints($admin);

        return response()->json([
            'success' => true,
            'remainingPoints' => $points
        ]);
    }

}
