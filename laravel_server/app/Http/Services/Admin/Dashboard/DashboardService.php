<?php

namespace App\Http\Services\Admin\Dashboard;

use App\Models\Company;
use App\Models\Job;
use App\Models\JobApply;
use App\Models\User;

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


}
