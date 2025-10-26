<?php

use App\Http\Controllers\Api\User\Company\CompanyController;
use App\Http\Controllers\Api\User\Job\JobController;
use Illuminate\Support\Facades\Route;

Route::prefix('user')->group(function () {
    Route::prefix('companies')->group(function () {
        Route::get('/', [CompanyController::class, 'index']);
        Route::get('/featured', [CompanyController::class, 'getFeaturedCompanies']);
        Route::get('/{id}', [CompanyController::class, 'show']);
        Route::get('/{id}/jobs', [JobController::class, 'getJobByCompany']);
    });
});
