<?php

use App\Http\Controllers\Api\Admin\Candidate\CandidateController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:admin')->prefix('admin')->group(function () {
    Route::prefix('candidates')->group(function () {
        Route::get('/', [CandidateController::class, 'index']);
        Route::get('/{id}', [CandidateController::class, 'show']);
    });
});



