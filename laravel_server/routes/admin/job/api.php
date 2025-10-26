<?php


use App\Http\Controllers\Api\Admin\Job\JobApplyController;
use App\Http\Controllers\Api\Admin\Job\JobController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin/job')
    ->middleware(['auth:admin', 'admin'])
    ->group(function () {
        Route::get('/search',[JobController::class, 'search']);

        Route::get('/urgent', [JobController::class, 'getUrgentJobs']);

        Route::get('/immediately', [JobController::class, 'getImmediatelyJobs']);

        Route::get('/job-counts', [JobController::class, 'getJobCountsByWorkField']);

        Route::get('/', [JobController::class, 'index']);

        Route::post('/', [JobController::class, 'store'])
            ->middleware('check.admin');
        Route::put('/{id}', [JobController::class, 'update'])
            ->middleware('check.admin');

        Route::get('/{jobId}/applicants', [JobApplyController::class, 'getApplicantByJob']);

        Route::get('/applications', [JobApplyController::class, 'index']);

        Route::get('/applications/{id}', [JobApplyController::class, 'show']);

        Route::put('/applications/{id}/status', [JobApplyController::class, 'updateStatus']);

        Route::get('/applications/{id}/candidate', [JobApplyController::class, 'getCandidateDetail']);

        Route::get('/{id}', [JobController::class, 'show']);

    });
