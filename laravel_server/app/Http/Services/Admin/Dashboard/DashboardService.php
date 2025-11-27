<?php

namespace App\Http\Services\Admin\Dashboard;

use App\Models\Company;
use App\Models\Job;
use App\Models\JobApply;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardService
{
    public function getTotalJobs()
    {
        return Job::count();
    }
    public function getTotalUsers()
    {
        return User::count();
    }
    public function getTotalCompanies()
    {
        return Company::count();
    }

    public function getNewJobsWeek(){
        return Job::where('created_at', '>=', now()->subWeek())->count();
    }
    public function getNewJobsMonth(){
        return  Job::where('created_at', '>=', now()->subMonth())->count();
    }

    public function getJobsPerMonth(): array
    {
        $months = collect([]);
        $counts = collect([]);

        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthLabel = $date->format('M');
            $count = Job::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $months->push($monthLabel);
            $counts->push($count);
        }

        return [
            'labels' => $months,
            'data' => $counts
        ];
    }

    public function getApplicantsPerWeek(): array
    {
        $days = [];
        $counts = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayLabel = $date->format('D');
            $count = JobApply::whereDate('created_at', $date->toDateString())->count();
            $days[] = $dayLabel;
            $counts[] = $count;
        }

        return [
            'labels' => $days,
            'data' => $counts
        ];
    }

    public function getTopCompanies()
    {
        $companies = Company::with('jobs.jobapply')
        ->withCount('jobs')
        ->get()
            ->map(function ($company) {
                $totalApplicants = $company->jobs->sum(function ($job) {
                    return $job->jobapply->count();
                });
                return [
                    'id' => $company->id,
                    'name' => $company->name,
                    'jobs_count' => $company->jobs_count,
                    'applicants_count' => $totalApplicants
                ];
            })
            ->sortByDesc('jobs_count')
            ->take(5)
            ->values();
        return $companies;
    }


    public function getEmployerJobs($request)
    {
        $companyId = $request->user()->company_id;
        return Job::where('company_id', $companyId)->count();
    }
    public function getEmployerNewJobsWeek($request)
    {
        $companyId = $request->user()->company_id;
        return Job::where('company_id', $companyId)
            -> where('created_at', '>=', now()->subWeek())
            -> count();
    }
    public function getEmployerNewJobsMonth($request){
        $companyId = $request->user()->company_id;
        return  Job::where('company_id', $companyId)
            -> where('created_at', '>=', now()->subMonth())
            ->count();
    }

    public function getEmployerApplicantsPerWeek($request)
    {
        $admin = $request->user();
        $companyId = $admin->company_id;

        $days = [];
        $counts = [];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayLabel = $date->format('D');

            $count = JobApply::whereHas('job', function ($q) use ($companyId) {
                $q->where('company_id', $companyId);
            })
                ->whereDate('created_at', $date->toDateString())
                ->count();

            $days[] = $dayLabel;
            $counts[] = $count;
        }

        return [
            'labels' => $days,
            'data' => $counts,
        ];
    }

    public function getEmployerJobsByStatus(Request $request): array
    {
        // LẤY ID SỐ, không lấy object
        $employerId = (int) $request->user()->id;
        $now = Carbon::now();

        // Đang hiển thị: đang active và chưa hết hạn (hoặc không có end_date)
        $active = Job::where('create_by', $employerId)
            ->where('is_active', 1)
            ->where(function ($q) use ($now) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '>=', $now);
            })
            ->count();

        // Hết hạn: có end_date < hôm nay
        $expired = Job::where('create_by', $employerId)
            ->whereNotNull('end_date')
            ->where('end_date', '<', $now)
            ->count();

        // Đã ẩn: is_active = 0
        $inactive = Job::where('create_by', $employerId)
            ->where('is_active', 0)
            ->count();

        return [
            'labels' => ['Đang hiển thị', 'Hết hạn', 'Đã ẩn'],
            'data'   => [$active, $expired, $inactive],
        ];
    }

    public function getEmployerRevenuePerMonth(Request $request): array
    {
        $employerId = (int) $request->user()->id;

        $startMonth = Carbon::now()->subMonths(11)->startOfMonth();
        $endMonth   = Carbon::now()->startOfMonth();

        $labels = [];
        $data   = [];

        $cursor = $startMonth->copy();

        while ($cursor <= $endMonth) {
            $year  = $cursor->year;
            $month = $cursor->month;

            $sumAmount = Payment::where('user_id', $employerId)
                ->where('status', 'success') // chỉnh lại nếu status khác
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->sum('amount');

            $labels[] = $cursor->format('m/Y');
            $data[]   = (int) $sumAmount;

            $cursor->addMonth();
        }

        return [
            'labels' => $labels,
            'data'   => $data,
        ];
    }

    public function getEmployerPointsPerMonth(Request $request): array
    {
        $employerId = (int) $request->user()->id;

        $startMonth = Carbon::now()->subMonths(11)->startOfMonth();
        $endMonth   = Carbon::now()->startOfMonth();

        $labels = [];
        $data   = [];

        $cursor = $startMonth->copy();

        while ($cursor <= $endMonth) {
            $year  = $cursor->year;
            $month = $cursor->month;

            $sumAmount = Payment::where('user_id', $employerId)
                ->where('status', 'success')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->sum('amount');

            // ví dụ: 1.000đ = 1 điểm
            $points = (int) floor($sumAmount / 1000);

            $labels[] = $cursor->format('m/Y');
            $data[]   = $points;

            $cursor->addMonth();
        }

        return [
            'labels' => $labels,
            'data'   => $data,
        ];
    }

    public function getEmployerPaymentSummary(Request $request): array
    {
        $employerId = (int) $request->user()->id;

        $successfulQuery = Payment::where('user_id', $employerId)
            ->where('status', 'success');

        $totalAmount      = (int) $successfulQuery->sum('amount');
        $successfulOrders = (int) $successfulQuery->count();
        $lastPaymentAt    = $successfulQuery->max('created_at');

        $allOrders = (int) Payment::where('user_id', $employerId)->count();

        $totalPoints = (int) floor($totalAmount / 1000);

        return [
            'total_amount'      => $totalAmount,
            'total_points'      => $totalPoints,
            'total_orders'      => $allOrders,
            'successful_orders' => $successfulOrders,
            'last_payment_at'   => $lastPaymentAt,
        ];
    }

}
