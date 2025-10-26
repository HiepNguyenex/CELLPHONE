<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Paths áp dụng CORS
    |--------------------------------------------------------------------------
    */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    /*
    |--------------------------------------------------------------------------
    | Cho phép tất cả method & header
    |--------------------------------------------------------------------------
    */
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Domain được phép truy cập API
    |--------------------------------------------------------------------------
    |
    | ⚡ Lưu ý:
    | - Thêm domain FE của bạn (Vercel)
    | - Giữ lại localhost để test local
    |
    */
    'allowed_origins' => [
        'https://cellphone-two.vercel.app', // ✅ FE trên Vercel
        'http://localhost:5173',            // ✅ local dev
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    /*
    |--------------------------------------------------------------------------
    | Header được expose / thời gian cache
    |--------------------------------------------------------------------------
    */
    'exposed_headers' => [],
    'max_age' => 0,

    /*
    |--------------------------------------------------------------------------
    | Có gửi cookie hay không
    |--------------------------------------------------------------------------
    |
    | Nếu bạn đang dùng token trong localStorage (Bearer) => false
    | Nếu bạn dùng cookie (Sanctum SPA) => true
    |
    */
    'supports_credentials' => false,
];
