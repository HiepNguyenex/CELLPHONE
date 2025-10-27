<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration for Cellphones API
    |--------------------------------------------------------------------------
    |
    | Tối ưu cho môi trường Render (backend) + Vercel (frontend).
    | Hỗ trợ cả cookie credentials và các request từ local dev.
    |
    */

    // ✅ Áp dụng cho tất cả API routes & Sanctum CSRF
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'register',
    ],

    // ✅ Cho phép tất cả HTTP methods
    'allowed_methods' => ['*'],

    // ✅ Cho phép tất cả headers
    'allowed_headers' => ['*'],

    // ✅ Các domain FE được phép truy cập API
    'allowed_origins' => [
        'https://cellphone-two.vercel.app', // Production frontend (Vercel)
        'http://localhost:5173',            // Local dev frontend
        'http://127.0.0.1:5173',            // Alternative local address
    ],

    // ✅ Không cần pattern match
    'allowed_origins_patterns' => [],

    // ✅ Không giới hạn cache thời gian preflight
    'max_age' => 0,

    // ✅ Không expose header đặc biệt
    'exposed_headers' => [],

    // ✅ RẤT QUAN TRỌNG: Cho phép gửi cookie + Authorization header
    'supports_credentials' => true,
];
