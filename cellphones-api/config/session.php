<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Session Driver
    |--------------------------------------------------------------------------
    |
    | Laravel hỗ trợ nhiều driver để lưu trữ session. Ở môi trường Render,
    | nên dùng "file" để đảm bảo đơn giản và tương thích tốt với cross-domain.
    |
    | Supported: "file", "cookie", "database", "memcached",
    |             "redis", "dynamodb", "array"
    |
    */

    'driver' => env('SESSION_DRIVER', 'file'),

    /*
    |--------------------------------------------------------------------------
    | Session Lifetime
    |--------------------------------------------------------------------------
    |
    | Thời gian session còn hiệu lực (tính bằng phút). Khi hết hạn, người dùng
    | sẽ bị logout. Có thể điều chỉnh qua biến môi trường SESSION_LIFETIME.
    |
    */

    'lifetime' => (int) env('SESSION_LIFETIME', 120),

    'expire_on_close' => env('SESSION_EXPIRE_ON_CLOSE', false),

    /*
    |--------------------------------------------------------------------------
    | Session Encryption
    |--------------------------------------------------------------------------
    |
    | Nếu đặt true, toàn bộ dữ liệu session sẽ được mã hóa. Ở đây không cần
    | bật trừ khi bạn lưu thông tin nhạy cảm trong session.
    |
    */

    'encrypt' => env('SESSION_ENCRYPT', false),

    /*
    |--------------------------------------------------------------------------
    | Session File Location
    |--------------------------------------------------------------------------
    |
    | Khi sử dụng driver "file", Laravel sẽ lưu các file session tại đây.
    |
    */

    'files' => storage_path('framework/sessions'),

    /*
    |--------------------------------------------------------------------------
    | Session Database Connection
    |--------------------------------------------------------------------------
    |
    | Chỉ dùng khi driver là "database". Không áp dụng trong trường hợp này.
    |
    */

    'connection' => env('SESSION_CONNECTION'),

    /*
    |--------------------------------------------------------------------------
    | Session Database Table
    |--------------------------------------------------------------------------
    */

    'table' => env('SESSION_TABLE', 'sessions'),

    /*
    |--------------------------------------------------------------------------
    | Session Cache Store
    |--------------------------------------------------------------------------
    */

    'store' => env('SESSION_STORE'),

    /*
    |--------------------------------------------------------------------------
    | Session Sweeping Lottery
    |--------------------------------------------------------------------------
    */

    'lottery' => [2, 100],

    /*
    |--------------------------------------------------------------------------
    | Session Cookie Name
    |--------------------------------------------------------------------------
    |
    | Laravel tự động tạo tên cookie dựa theo APP_NAME.
    |
    */

    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug(env('APP_NAME', 'laravel'), '_').'_session'
    ),

    /*
    |--------------------------------------------------------------------------
    | Session Cookie Path
    |--------------------------------------------------------------------------
    */

    'path' => env('SESSION_PATH', '/'),

    /*
    |--------------------------------------------------------------------------
    | Session Cookie Domain
    |--------------------------------------------------------------------------
    |
    | Domain mà cookie sẽ được gửi kèm. Cực kỳ quan trọng khi frontend
    | chạy trên Vercel (.vercel.app) và backend chạy Render.
    |
    | VD: SESSION_DOMAIN=.vercel.app
    |
    */

    'domain' => env('SESSION_DOMAIN', null),

    /*
    |--------------------------------------------------------------------------
    | HTTPS Only Cookies
    |--------------------------------------------------------------------------
    |
    | Khi bật true, cookie chỉ được gửi qua HTTPS. Bắt buộc bật true
    | nếu SameSite=None để Chrome không chặn cookie cross-domain.
    |
    */

    'secure' => env('SESSION_SECURE_COOKIE', true),

    /*
    |--------------------------------------------------------------------------
    | HTTP Access Only
    |--------------------------------------------------------------------------
    |
    | Nếu bật true, cookie không thể bị truy cập bởi JavaScript (chỉ server đọc được).
    |
    */

    'http_only' => env('SESSION_HTTP_ONLY', true),

    /*
    |--------------------------------------------------------------------------
    | Same-Site Cookies
    |--------------------------------------------------------------------------
    |
    | Cực kỳ quan trọng: Laravel chỉ chấp nhận các giá trị "lax", "strict", "none".
    | Khi cross-domain (Render ↔ Vercel), bắt buộc dùng "none" (chữ thường).
    |
    */

    'same_site' => env('SESSION_SAME_SITE', 'none'),

    /*
    |--------------------------------------------------------------------------
    | Partitioned Cookies (optional)
    |--------------------------------------------------------------------------
    |
    | Nếu đặt true, cookie sẽ được partitioned theo top-level site.
    | Không cần bật trừ khi bạn chạy iframe hoặc embedded apps.
    |
    */

    'partitioned' => env('SESSION_PARTITIONED_COOKIE', false),

];
