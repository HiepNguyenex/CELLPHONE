<?php

use Illuminate\Support\Facades\Route;

// ✅ Root endpoint cho healthcheck / test API
Route::get('/', fn() => response()->json([
    'status' => 'ok',
    'app' => 'Cellphones API v1'
]));

// ✅ Sanctum sẽ tự xử lý /sanctum/csrf-cookie ở đây
