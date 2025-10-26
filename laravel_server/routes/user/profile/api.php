<?php

use App\Http\Controllers\Api\User\Profile\UserCertificateController;
use App\Http\Controllers\Api\User\Profile\UserEducationController;
use App\Http\Controllers\Api\User\Profile\UserLanguageController;
use App\Http\Controllers\Api\User\Profile\UserProjectController;
use App\Http\Controllers\Api\User\Profile\UserSkillController;
use App\Http\Controllers\Api\User\Profile\UserWorkExperienceController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\User\Profile\ProfileController;

/*
|--------------------------------------------------------------------------
| User Profile Routes
|--------------------------------------------------------------------------
| Quản lý thông tin hồ sơ ứng viên (user profile)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:user')->prefix('user')->group(function () {
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'getProfile']);
        Route::get('/basic-info', [ProfileController::class, 'getBasicInfo']);
        Route::get('/job-criteria', [ProfileController::class, 'getJobCriteria']);
        Route::get('/general-info', [ProfileController::class, 'getGeneralInfo']);

        Route::put('/basic-info', [ProfileController::class, 'updateBasicInfo']);
        Route::put('/job-search-status', [ProfileController::class, 'updateJobSearchStatus']);
        Route::post('/avatar', [ProfileController::class, 'updateAvatar']);
        Route::put('/job-criteria', [ProfileController::class, 'updateJobCriteria']);
        Route::put('/general-info', [ProfileController::class, 'updateGeneralInfo']);

        Route::put('/change-password', [ProfileController::class, 'changePassword']);

        Route::prefix('cvs')->group(function () {
            Route::get('/', [ProfileController::class, 'getCV']);
            Route::post('/', [ProfileController::class, 'createCV']);
            Route::delete('/{id}', [ProfileController::class, 'deleteCV']);
            Route::post('/{id}/set-main', [ProfileController::class, 'updateMainCV']);
        });

        Route::prefix('work-experiences')->group(function () {
            Route::get('/', [UserWorkExperienceController::class, 'index']);
            Route::get('/{id}', [UserWorkExperienceController::class, 'show']);
            Route::post('/', [UserWorkExperienceController::class, 'store']);
            Route::put('/{id}', [UserWorkExperienceController::class, 'update']);
            Route::delete('/{id}', [UserWorkExperienceController::class, 'destroy']);
        });

        Route::prefix('educations')->group(function () {
            Route::get('/', [UserEducationController::class, 'index']);
            Route::get('/{id}', [UserEducationController::class, 'show']);
            Route::post('/', [UserEducationController::class, 'store']);
            Route::put('/{id}', [UserEducationController::class, 'update']);
            Route::delete('/{id}', [UserEducationController::class, 'destroy']);
        });

        Route::prefix('skills')->group(function () {
            Route::get('/', [UserSkillController::class, 'index']);
            Route::get('/{id}', [UserSkillController::class, 'show']);
            Route::post('/', [UserSkillController::class, 'store']);
            Route::put('/{id}', [UserSkillController::class, 'update']);
            Route::delete('/{id}', [UserSkillController::class, 'destroy']);
        });

        Route::prefix('projects')->group(function () {
            Route::get('/', [UserProjectController::class, 'index']);
            Route::get('/{id}', [UserProjectController::class, 'show']);
            Route::post('/', [UserProjectController::class, 'store']);
            Route::put('/{id}', [UserProjectController::class, 'update']);
            Route::delete('/{id}', [UserProjectController::class, 'destroy']);
        });

        Route::prefix('certificates')->group(function () {
            Route::get('/', [UserCertificateController::class, 'index']);
            Route::get('/{id}', [UserCertificateController::class, 'show']);
            Route::post('/', [UserCertificateController::class, 'store']);
            Route::post('/{id}', [UserCertificateController::class, 'update']);
            Route::delete('/{id}', [UserCertificateController::class, 'destroy']);
        });

        Route::prefix('languages')->group(function () {
            Route::get('/', [UserLanguageController::class, 'index']);
            Route::get('/{id}', [UserLanguageController::class, 'show']);
            Route::post('/', [UserLanguageController::class, 'store']);
            Route::put('/{id}', [UserLanguageController::class, 'update']);
            Route::delete('/{id}', [UserLanguageController::class, 'destroy']);
        });

    });
});
