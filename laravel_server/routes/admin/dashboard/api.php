<?php

use App\Http\Controllers\Api\Admin\Dashboard\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:admin', 'check.root.role'])
    ->prefix('admin/dashboard')
    ->group(function () {
        Route::get('/total-jobs', [DashboardController::class, 'getTotalJobs']);
        Route::get('/new-jobs-week', [DashboardController::class, 'getNewJobsWeek']);
        Route::get('/new-jobs-month', [DashboardController::class, 'getNewJobsMonth']);
        Route::get('/total-users', [DashboardController::class, 'getTotalUsers']);
        Route::get('/total-companies', [DashboardController::class, 'getTotalCompanies']);
        Route::get('/jobs-per-month', [DashboardController::class, 'getJobsPerMonth']);
        Route::get('/applicants-per-week', [DashboardController::class, 'getApplicantsPerWeek']);
        Route::get('/top-companies', [DashboardController::class, 'getTopCompanies']);
        Route::get('/revenue-per-month', [DashboardController::class, 'getRevenuePerMonth']);
        Route::get('/points-per-month', [DashboardController::class, 'getPointsPerMonth']);
        Route::get('/payment-summary', [DashboardController::class, 'getPaymentSummary']);
    });

Route::middleware(['auth:admin'])
    ->prefix('admin/employer-dashboard')
    ->group(function () {
        Route::get('/total-jobs', [DashboardController::class, 'getEmployerJobs']);
        Route::get('/new-jobs-week', [DashboardController::class, 'getEmployerNewJobsWeek']);
        Route::get('/new-jobs-month', [DashboardController::class, 'getEmployerNewJobsMonth']);
        Route::get('/applicants-per-week', [DashboardController::class, 'getEmployerApplicantsPerWeek']);
        Route::get('/job-by-status', [DashboardController::class, 'getEmployerJobsByStatus']);
        Route::get('/revenue-per-month', [DashboardController::class, 'getEmployerRevenuePerMonth']);
        Route::get('/point-per-month', [DashboardController::class, 'getEmployerPointsPerMonth']);
        Route::get('/payment-summary', [DashboardController::class, 'getEmployerPaymentSummary']);
    });
