<?php

return [

    // ✅ Áp dụng cho API & Sanctum
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // ✅ Cho phép tất cả method & header
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],

    // ✅ Domain được phép gọi API
    'allowed_origins' => [
        'https://cellphone-two.vercel.app', // FE deploy trên Vercel
        'http://localhost:5173',            // FE local dev
        'http://127.0.0.1:5173',            // fallback local
    ],

    'allowed_origins_patterns' => [],

    'exposed_headers' => [],
    'max_age' => 0,

    // ✅ Quan trọng: Bật credentials
    'supports_credentials' => true,
];
