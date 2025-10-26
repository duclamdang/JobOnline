<?php

use App\Http\Controllers\Api\User\Job\JobApplyController;
use App\Http\Controllers\Api\User\Job\JobController;
use App\Http\Controllers\Api\User\Job\JobSaveController;
use Illuminate\Support\Facades\Route;

Route::prefix('job')->group(function () {
    Route::get('/search', [JobController::class, 'search']);

    Route::get('/urgent', [JobController::class, 'getUrgentJobs']);

    Route::get('/immediately', [JobController::class, 'getImmediatelyJobs']);

    Route::get('/job-counts', [JobController::class, 'getJobCountsByWorkField']);

    Route::get('/', [JobController::class, 'index']);


    Route::prefix('user')->middleware('auth:user')->group(function () {
        Route::get('/applied', [JobApplyController::class, 'index']);

        Route::post('/apply', [JobApplyController::class, 'store']);


        Route::get('/saved', [JobSaveController::class, 'index']);

        Route::post('/saved', [JobSaveController::class, 'store']);

        Route::delete('/saved/{id}', [JobSaveController::class, 'destroy'])
            ->whereNumber('id');
    });

    Route::get('/{id}', [JobController::class, 'show'])
        ->whereNumber('id');
});
