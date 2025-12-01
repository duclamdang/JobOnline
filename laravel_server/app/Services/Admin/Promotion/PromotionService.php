<?php

namespace App\Services\Admin\Promotion;

use App\Models\Admin;
use App\Models\Promotion;
use Cloudinary\Configuration\Configuration;
use Cloudinary\Cloudinary;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

class PromotionService
{
    public function paginatePromotions(int $perPage = 20): LengthAwarePaginator
    {
        return Promotion::orderByDesc('id')->paginate($perPage);
    }
    public function getAvailablePromotions(): Collection
    {
        return Promotion::available()
            ->orderBy('price')
            ->get([
                'id',
                'name',
                'description',
                'price',
                'points',
                'start_at',
                'end_at',
                'image_url',
            ]);
    }
    public function findPromotion(int $id): Promotion
    {
        return Promotion::findOrFail($id);
    }
    protected function uploadImage(?UploadedFile $image): ?string
    {
        if (!$image) {
            return null;
        }

        $config = new Configuration([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
        ]);

        $cloudinary = new Cloudinary($config);

        $uploaded = $cloudinary->uploadApi()->upload(
            $image->getRealPath(),
            [
                'folder'        => 'jobonline/promotions',
                'resource_type' => 'image',
            ]
        );

        return $uploaded['secure_url'] ?? null;
    }
    public function createPromotion(Admin $admin, array $data, ?UploadedFile $image = null): array
    {
        try {
            if ($image) {
                $imageUrl = $this->uploadImage($image);
                if ($imageUrl) {
                    $data['image_url'] = $imageUrl;
                }
            }

            $data['is_active']  = $data['is_active'] ?? true;
            $data['created_by'] = $admin->id;
            $data['updated_by'] = $admin->id;

            $promotion = Promotion::create($data);

            return [
                'success'   => true,
                'message'   => 'Tạo khuyến mãi thành công',
                'promotion' => $promotion->fresh(),
            ];
        } catch (\Exception $e) {
            Log::error('Create promotion error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Lỗi tạo khuyến mãi, vui lòng thử lại sau',
            ];
        }
    }
    public function updatePromotion(Admin $admin, Promotion $promotion, array $data, ?UploadedFile $image = null): array
    {
        if (!$promotion) {
            return [
                'success' => false,
                'message' => 'Khuyến mãi không tồn tại',
            ];
        }

        try {
            if ($image) {
                $imageUrl = $this->uploadImage($image);
                if ($imageUrl) {
                    $data['image_url'] = $imageUrl;
                }
            }

            $data['updated_by'] = $admin->id;

            $promotion->update($data);

            return [
                'success'   => true,
                'message'   => 'Cập nhật khuyến mãi thành công',
                'promotion' => $promotion->fresh(),
            ];
        } catch (\Exception $e) {
            Log::error('Update promotion error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'Lỗi cập nhật khuyến mãi, vui lòng thử lại sau',
            ];
        }
    }
    public function deletePromotion(Promotion $promotion): void
    {
        $promotion->delete();
    }
}
