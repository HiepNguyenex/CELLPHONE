<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Paths
    |--------------------------------------------------------------------------
    | Những path áp dụng CORS. Để 'api/*' là đủ cho tất cả route API.
    */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    /*
    |--------------------------------------------------------------------------
    | Allowed Methods / Headers / Origins
    |--------------------------------------------------------------------------
    */
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],

    // KHÔNG dùng '*' nếu bật supports_credentials = true.
    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],
    'allowed_origins_patterns' => [],

    /*
    |--------------------------------------------------------------------------
    | Exposed headers / Max age / Credentials
    |--------------------------------------------------------------------------
    */
    'exposed_headers' => [],
    'max_age' => 0,

    // Bạn đang dùng Bearer token (localStorage) => để false.
    // Nếu dùng cookie Sanctum thì chuyển thành true.
    'supports_credentials' => false,
];
