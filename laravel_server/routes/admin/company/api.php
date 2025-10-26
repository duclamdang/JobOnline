<?php

use App\Http\Controllers\Api\Admin\Company\CompanyController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:admin')->prefix('admin')->group(function () {
    Route::prefix('companies')->group(function () {
        Route::get('/my-company', [CompanyController::class, 'getMyCompany']);

        Route::middleware('check.root.role')->group(function () {
            Route::get('/', [CompanyController::class, 'getAll']);
            Route::post('/', [CompanyController::class, 'store']);
            Route::get('/{id}', [CompanyController::class, 'getById']);
            Route::put('/{id}/basic', [CompanyController::class, 'updateBasicInfo']);
            Route::post('/{id}/license', [CompanyController::class, 'updateBusinessLicense']);
            Route::put('/{id}/additional', [CompanyController::class, 'updateAdditional']);
            Route::post('/{id}/image', [CompanyController::class, 'updateImage']);
        });

        Route::middleware('check.company.role')->group(function () {
            Route::put('/basic', [CompanyController::class, 'updateBasicInfo']);
            Route::post('/license', [CompanyController::class, 'updateBusinessLicense']);
            Route::put('/additional', [CompanyController::class, 'updateAdditional']);
            Route::post('/image', [CompanyController::class, 'updateImage']);
        });
    });
});
