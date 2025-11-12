<?php

use App\Http\Controllers\Api\User\AI\GroqController;
use Illuminate\Support\Facades\Route;

Route::post('/ai/chat', [GroqController::class, 'chat']);
// routes/api.php
Route::get('/ping', fn() => response()->json(['ok' => true]));
