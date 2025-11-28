<?php

namespace App\Http\Services\Admin\Company;

use App\Models\Company;
use App\Models\Admin;
use Cloudinary\Cloudinary;
use Cloudinary\Configuration\Configuration;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class CompanyService
{
    private function findCompanyByAdmin(int $id): ?Company
    {
        return Company::find($id);
    }

    public function create(array $data): array
    {
        try {
            if (Company::where('tax_code', $data['tax_code'])->exists()) {
                return [
                    'success' => false,
                    'message' => 'Mã số thuế đã tồn tại',
                ];
            }

            $company = Company::create([
                'name'         => $data['name'],
                'slug'         => Str::slug($data['name']),
                'tax_code'     => $data['tax_code'] ?? null,
                'email'        => $data['email'] ?? null,
                'phone'        => $data['phone'] ?? null,
                'address'      => $data['address'] ?? null,
                'location_id'  => $data['location_id'] ?? null,
                'industry_id'  => $data['industry_id'] ?? null,
                'company_size' => $data['company_size'] ?? null,
            ]);

            return [
                'success' => true,
                'message' => 'Tạo công ty thành công',
                'company' => $company,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getAll(int $perPage = 10): array
    {
        $companies = Company::query()
            ->with(['location', 'industry'])
            ->paginate($perPage);

        return [
            'success'   => true,
            'message'   => 'Lấy danh sách công ty thành công',
            'companies' => $companies,
        ];
    }

    public function getById(int $id): array
    {
        $company = Company::query()
            ->with(['location', 'industry'])
            ->find($id);

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Công ty không tồn tại',
            ];
        }

        return [
            'success' => true,
            'message' => 'Lấy thông tin công ty thành công',
            'company' => $company,
        ];
    }

    public function getMyCompany(Admin $admin): array
    {
        if (empty($admin->company_id)) {
            return [
                'success' => false,
                'message' => 'Bạn chưa liên kết với công ty nào',
            ];
        }

        $company = Company::query()
            ->with(['location', 'industry'])
            ->find($admin->company_id);

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Công ty liên kết không tồn tại',
            ];
        }

        return [
            'success' => true,
            'message' => 'Lấy thông tin công ty thành công',
            'company' => $company,
        ];
    }

    public function updateBasicInfo(Company $company, array $data): array
    {
        $updateData = [
            'company_size' => $data['company_size'] ?? $company->company_size,
            'email'        => $data['email']        ?? $company->email,
            'phone'        => $data['phone']        ?? $company->phone,
            'address'      => $data['address']      ?? $company->address,
            'location_id'  => $data['location_id']  ?? $company->location_id,
            'industry_id'  => $data['industry_id']  ?? $company->industry_id,
        ];

        if (!empty($data['name']) && $data['name'] !== $company->name) {
            $updateData['name'] = $data['name'];
            $updateData['slug'] = Str::slug($data['name']);
        }

        $company->update($updateData);

        return [
            'success' => true,
            'message' => "Cập nhật thông tin cơ bản thành công",
            'company' => $company,
        ];
    }

    public function updateBasicInfoByAdmin(Admin $admin, array $data): array
    {
        if (empty($admin->company_id)) {
            return [
                'success' => false,
                'message' => 'Bạn chưa liên kết với công ty nào',
            ];
        }

        $company = $this->findCompanyByAdmin($admin->company_id);

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Công ty liên kết không tồn tại',
            ];
        }

        return $this->updateBasicInfo($company, $data);
    }

    public function updateBasicInfoById(int $id, array $data): array
    {
        $company = $this->findCompanyByAdmin($id);

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Công ty không tồn tại',
            ];
        }

        return $this->updateBasicInfo($company, $data);
    }

    public function updateBusinessLicense(Company $company, $fileOrPath): array
    {
        if ($fileOrPath && is_object($fileOrPath)) {
            $originalName = pathinfo($fileOrPath->getClientOriginalName(), PATHINFO_FILENAME);
            $extension    = $fileOrPath->getClientOriginalExtension();
            $uniqueId     = uniqid();
            $filename     = $originalName . '_' . $uniqueId . '.' . $extension;

            $path = $fileOrPath->storeAs('companies/licenses', $filename, 'public');
        } else {
            $path = $fileOrPath ?? $company->business_license;
        }

        $company->update([
            'business_license' => $path,
        ]);

        return [
            'success' => true,
            'message' => 'Cập nhật giấy phép kinh doanh thành công',
            'company' => $company,
        ];
    }

    public function updateBusinessLicenseByAdmin(Admin $admin, $fileOrPath): array
    {
        if (empty($admin->company_id)) {
            return [
                'success' => false,
                'message' => 'Bạn chưa liên kết với công ty nào',
            ];
        }

        $company = $this->findCompanyByAdmin($admin->company_id);

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Công ty liên kết không tồn tại',
            ];
        }

        return $this->updateBusinessLicense($company, $fileOrPath);
    }

    public function updateBusinessLicenseById(int $id, $fileOrPath): array
    {
        $company = $this->findCompanyByAdmin($id);

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Công ty không tồn tại',
            ];
        }

        return $this->updateBusinessLicense($company, $fileOrPath);
    }

    public function updateAdditional(Company $company, array $data): array
    {
        $company->update([
            'website'       => $data['website']       ?? $company->website,
            'description'   => $data['description']   ?? $company->description,
            'founded_year'  => $data['founded_year']  ?? $company->founded_year,
        ]);

        return [
            'success' => true,
            'message' => 'Cập nhật thông tin bổ sung thành công',
            'company' => $company,
        ];
    }

    public function updateAdditionalByAdmin(Admin $admin, array $data): array
    {
        if (empty($admin->company_id)) {
            return [
                'success' => false,
                'message' => 'Bạn chưa liên kết với công ty nào',
            ];
        }

        $company = $this->findCompanyByAdmin($admin->company_id);

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Công ty liên kết không tồn tại',
            ];
        }

        return $this->updateAdditional($company, $data);
    }

    public function updateAdditionalById(int $id, array $data): array
    {
        $company = $this->findCompanyByAdmin($id);

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Công ty không tồn tại',
            ];
        }

        return $this->updateAdditional($company, $data);
    }

    public function updateImage(Company $company, array $data): array
    {
        /** @var UploadedFile|null $logoFile */
        $logoFile = $data['logo'] ?? null;

        /** @var UploadedFile|null $coverFile */
        $coverFile = $data['cover_image'] ?? null;

        if (!$logoFile && !$coverFile) {
            return [
                'success' => false,
                'message' => 'Không có ảnh nào được tải lên',
            ];
        }

        $config = new Configuration([
            'cloud' => [
                'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
                'api_key'    => env('CLOUDINARY_API_KEY'),
                'api_secret' => env('CLOUDINARY_API_SECRET'),
            ],
        ]);
        $cloudinary = new Cloudinary($config);

        $handleUpload = function (?UploadedFile $file, string $oldUrl = null, string $folder = 'companies/images') use ($cloudinary) {
            if ($file && is_object($file)) {
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $extension    = $file->getClientOriginalExtension();
                $uniqueId     = uniqid();
                $filename     = $originalName . '_' . $uniqueId . '.' . $extension;

                try {
                    $uploaded = $cloudinary->uploadApi()->upload(
                        $file->getRealPath(),
                        [
                            'folder'        => $folder,
                            'resource_type' => 'image',
                        ]
                    );

                    return $uploaded['secure_url'];
                } catch (\Exception $e) {
                    Log::error('Cloudinary upload company image error: ' . $e->getMessage());
                    return $oldUrl;
                }
            }

            return $oldUrl;
        };

        $logoUrl       = $handleUpload($logoFile, $company->logo, 'companies/logos');
        $coverImageUrl = $handleUpload($coverFile, $company->cover_image, 'companies/covers');

        $company->update([
            'logo'        => $logoUrl,
            'cover_image' => $coverImageUrl,
        ]);

        return [
            'success' => true,
            'message' => 'Cập nhật thông tin ảnh thành công',
            'company' => $company,
        ];
    }

    public function updateImageByAdmin(Admin $admin, array $data): array
    {
        if (empty($admin->company_id)) {
            return [
                'success' => false,
                'message' => 'Bạn chưa liên kết với công ty nào',
            ];
        }

        $company = $this->findCompanyByAdmin($admin->company_id);

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Công ty liên kết không tồn tại',
            ];
        }

        return $this->updateImage($company, $data);
    }

    public function updateImageById(int $id, array $data): array
    {
        $company = $this->findCompanyByAdmin($id);

        if (!$company) {
            return [
                'success' => false,
                'message' => 'Công ty không tồn tại',
            ];
        }

        return $this->updateImage($company, $data);
    }

}
