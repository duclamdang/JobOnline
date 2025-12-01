<?php

namespace App\Http\Controllers\Api\Admin\Promotion;

use App\Constants\HttpStatus;
use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Services\Admin\Promotion\PromotionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PromotionController extends Controller
{
    protected PromotionService $promotionService;

    public function __construct(PromotionService $promotionService)
    {
        $this->promotionService = $promotionService;
    }

    protected function ensureRoot(Admin $admin): ?JsonResponse
    {
        if ($admin->role_id !== 1) {
            return response()->json([
                'status_code' => HttpStatus::FORBIDDEN,
                'message'     => 'Chỉ admin hệ thống mới được quản lý khuyến mãi',
            ], HttpStatus::FORBIDDEN);
        }

        return null;
    }
    public function index(Request $request): JsonResponse
    {
        /** @var Admin $admin */
        $admin = $request->user('admin');
        if ($resp = $this->ensureRoot($admin)) {
            return $resp;
        }

        $promotions = $this->promotionService->paginatePromotions(20);

        return response()->json([
            'status_code' => HttpStatus::OK,
            'data'        => $promotions,
        ], HttpStatus::OK);
    }
    public function available(Request $request): JsonResponse
    {
        $promotions = $this->promotionService->getAvailablePromotions();

        return response()->json([
            'status_code' => HttpStatus::OK,
            'data'        => $promotions,
        ], HttpStatus::OK);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $admin = $request->user('admin');
        if ($resp = $this->ensureRoot($admin)) {
            return $resp;
        }

        $promotion = $this->promotionService->findPromotion($id);

        return response()->json([
            'status_code' => HttpStatus::OK,
            'data'        => $promotion,
        ], HttpStatus::OK);
    }

    public function store(Request $request): JsonResponse
    {
        $admin = $request->user('admin');
        if ($resp = $this->ensureRoot($admin)) {
            return $resp;
        }
        $validator = Validator::make(
            $request->all(),
            [
                'name'        => 'required|string|max:255',
                'code'        => 'nullable|string|max:50',
                'description' => 'nullable|string',
                'price'       => 'required|integer|min:1000',
                'points'      => 'required|integer|min:1',
                'start_at'    => 'nullable|date',
                'end_at'      => 'nullable|date|after_or_equal:start_at',
                'is_active'   => 'nullable|boolean',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE);
        }

        $data  = $validator->validated();
        $image = $request->file('image'); // UploadedFile | null
        Log::info('DEBUG upload promotion image', [
            'has_file' => $request->hasFile('image'),
            'image'    => $image ? get_class($image) : null,
        ]);
        if ($image) {
            $imageValidator = Validator::make(
                ['image' => $image],
                ['image' => 'image|mimes:jpg,jpeg,png,webp|max:8192']
            );

            if ($imageValidator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $imageValidator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }
        }
        $result = $this->promotionService->createPromotion($admin, $data, $image);

        if (!$result['success']) {
            return response()->json([
                'status_code' => HttpStatus::INTERNAL_ERROR,
                'message'     => $result['message'],
                'data'        => [],
            ], HttpStatus::INTERNAL_ERROR);
        }

        return response()->json([
            'status_code' => HttpStatus::CREATED,
            'message'     => $result['message'],
            'data'        => $result['promotion'],
        ], HttpStatus::CREATED);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $admin = $request->user('admin');
        if ($resp = $this->ensureRoot($admin)) {
            return $resp;
        }

        $promotion = $this->promotionService->findPromotion($id);
        $validator = Validator::make(
            $request->all(),
            [
                'name'        => 'sometimes|string|max:255',
                'code'        => 'nullable|string|max:50',
                'description' => 'nullable|string',
                'price'       => 'sometimes|integer|min:1000',
                'points'      => 'sometimes|integer|min:1',
                'start_at'    => 'nullable|date',
                'end_at'      => 'nullable|date|after_or_equal:start_at',
                'is_active'   => 'nullable|boolean',
            ]
        );

        if ($validator->fails()) {
            return response()->json([
                'status_code'    => HttpStatus::UNPROCESSABLE,
                'data'           => [],
                'error_messages' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE);
        }

        $data  = $validator->validated();
        $image = $request->file('image');
        Log::info('DEBUG upload promotion image', [
            'has_file' => $request->hasFile('image'),
            'image'    => $image ? get_class($image) : null,
        ]);
        if ($image) {
            $imageValidator = Validator::make(
                ['image' => $image],
                ['image' => 'image|mimes:jpg,jpeg,png,webp|max:8192']
            );

            if ($imageValidator->fails()) {
                return response()->json([
                    'status_code'    => HttpStatus::UNPROCESSABLE,
                    'data'           => [],
                    'error_messages' => $imageValidator->errors(),
                ], HttpStatus::UNPROCESSABLE);
            }
        }
        $result = $this->promotionService->updatePromotion($admin, $promotion, $data, $image);

        if (!$result['success']) {
            return response()->json([
                'status_code' => HttpStatus::INTERNAL_ERROR,
                'message'     => $result['message'],
                'data'        => [],
            ], HttpStatus::INTERNAL_ERROR);
        }

        return response()->json([
            'status_code' => HttpStatus::OK,
            'message'     => $result['message'],
            'data'        => $result['promotion'],
        ], HttpStatus::OK);
    }



    public function destroy(Request $request, int $id): JsonResponse
    {
        $admin = $request->user('admin');
        if ($resp = $this->ensureRoot($admin)) {
            return $resp;
        }

        $promotion = $this->promotionService->findPromotion($id);
        $this->promotionService->deletePromotion($promotion);

        return response()->json([
            'status_code' => HttpStatus::OK,
            'message'     => 'Xoá khuyến mãi thành công',
        ], HttpStatus::OK);
    }
}
