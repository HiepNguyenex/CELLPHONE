<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration for Cellphones API (Render + Vercel)
    |--------------------------------------------------------------------------
    |
    | Cho phép frontend (Vercel) gọi API backend (Render)
    | với cookie & token hợp lệ qua Sanctum.
    |
    */

    // ✅ Áp dụng cho tất cả route cần CORS + CSRF
    'paths' => [
        'api/*',
        'v1/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'register',
    ],

    // ✅ Cho phép mọi method
    'allowed_methods' => ['*'],

    // ✅ Cho phép origin lấy từ .env (dễ đổi môi trường)
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173')),

    'allowed_origins_patterns' => [],

    // ✅ Cho phép tất cả headers
    'allowed_headers' => ['*'],

    // ✅ Không giới hạn cache preflight
    'max_age' => 0,

    // ✅ Không cần expose header đặc biệt
    'exposed_headers' => [],

    // ✅ Cực kỳ quan trọng: Cho phép gửi cookie / Authorization header
    'supports_credentials' => true,
];
