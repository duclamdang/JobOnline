<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Shared\LocationController;
use App\Http\Controllers\Api\Shared\JobCatalogController;

/*
|--------------------------------------------------------------------------
| Shared Routes
|--------------------------------------------------------------------------
| Đây là nơi định nghĩa các API dùng chung cho toàn hệ thống
| như Location (tỉnh/huyện/xã) và Job Catalog (danh mục việc làm).
|--------------------------------------------------------------------------
*/

Route::prefix('locations')->group(function () {
    Route::get('/provinces', [LocationController::class, 'getAllProvinces']);
    Route::get('/districts/{provinceId}', [LocationController::class, 'getDistrictsByProvince']);
    Route::get('/wards/{districtId}', [LocationController::class, 'getWardsByDistrict']);
});

Route::prefix('catalogs')->group(function () {
    Route::get('/working-forms', [JobCatalogController::class, 'getAllWorkingForms']);
    Route::get('/positions', [JobCatalogController::class, 'getAllPositions']);
    Route::get('/languages', [JobCatalogController::class, 'getAllLanguages']);
    Route::get('/work-experiences', [JobCatalogController::class, 'getAllWorkExperiences']);
    Route::get('/educations', [JobCatalogController::class, 'getAllEducations']);
    Route::get('/work-fields', [JobCatalogController::class, 'getAllWorkFields']);
    Route::get('/majors', [JobCatalogController::class, 'getAllMajors']);
    Route::get('/industries', [JobCatalogController::class, 'getAllIndustries']);
});
