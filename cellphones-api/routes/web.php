<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// Healthcheck
Route::get('/', fn() => response()->json([
    'status' => 'ok',
    'app'    => 'Cellphones API v1',
]));

// ✅ Nhóm route stateful (session + CSRF) cho SPA user — GIỮ prefix /api
Route::prefix('api')->middleware('web')->group(function () {
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/logout',   [AuthController::class, 'logout']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::get('/me',        [AuthController::class, 'user'])->middleware('auth');
});

// ✅ Khớp các endpoint FE đang dùng dưới /api/v1
Route::prefix('api/v1')->middleware('web')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']); // FE: /v1/logout
    Route::get('/user',    [AuthController::class, 'user'])->middleware('auth'); // FE: /v1/user
});

// ⚠️ Các API tài nguyên khác vẫn nằm ở routes/api.php (prefix /api/v1/...)
