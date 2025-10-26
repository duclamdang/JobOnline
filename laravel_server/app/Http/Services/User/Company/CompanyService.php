<?php

namespace App\Http\Services\User\Company;

use App\Models\Company;
use App\Models\Job;
use Illuminate\Support\Carbon;

class CompanyService
{
    public function filterCompanies(array $filters = [], int $perPage = 10): array
    {
        $query = Company::query()
            ->active()
            ->with(['location', 'industry'])
            ->withCount(['jobs as active_jobs_count' => function ($query) {
                $query->where('is_active', 1)
                    ->whereDate('end_date', '>=', Carbon::today());
            }])
            ->latest('id');

        if (!empty($filters['industry_id'])) {
            $query->where('industry_id', $filters['industry_id']);
        }

        if (!empty($filters['location_id'])) {
            $query->where('location_id', $filters['location_id']);
        }

        if (!empty($filters['keyword'])) {
            $keyword = strtolower($filters['keyword']);
            $query->whereRaw('LOWER(name) LIKE ?', ["%{$keyword}%"]);
        }

        $companies = $query->paginate($perPage);

        if ($companies->isEmpty()) {
            return [
                'success' => false,
                'message' => "Không tìm thấy công ty nào phù hợp",
            ];
        }

        return [
            'success'   => true,
            'message'   => "Lấy danh sách công ty thành công",
            'companies' => $companies,
        ];
    }

    public function getFeaturedCompanies(int $limit = 6): array
    {
        $companies = Company::query()
            ->active()
            ->with(['location', 'industry'])
            ->withCount(['jobs as active_jobs_count' => function ($query) {
                $query->where('is_active', 1)
                    ->whereDate('end_date', '>=', Carbon::today());
            }])
            ->orderByDesc('active_jobs_count')
            ->limit($limit)
            ->get();

        if ($companies->isEmpty()) {
            return [
                'success' => false,
                'message' => "Không có công ty nào khả dụng",
            ];
        }

        return [
            'success'   => true,
            'message'   => "Lấy danh sách công ty nổi bật thành công",
            'companies' => $companies,
        ];
    }

    public function getById(int $id): array
    {
        $company = Company::query()
            ->active()
            ->with(['location', 'industry'])
            ->withCount(['jobs as active_jobs_count' => function ($query) {
                $query->where('is_active', 1)
                    ->whereDate('end_date', '>=', Carbon::today());
            }])
            ->find($id);

        if (!$company) {
            return [
                'success' => false,
                'message' => "Công ty không tồn tại hoặc đã ngừng hoạt động",
            ];
        }

        return [
            'success' => true,
            'message' => "Lấy thông tin công ty thành công",
            'company' => $company,
        ];
    }
}
