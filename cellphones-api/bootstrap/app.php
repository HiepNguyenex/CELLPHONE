<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// 👇 import thêm Provider mới
use App\Providers\EventServiceProvider;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // ✅ Cho phép Sanctum nhận diện frontend cross-domain (Render <-> Vercel)
        $middleware->statefulApi();

        // 1️⃣ Nhóm middleware cho API
        $middleware->group('api', [
            EnsureFrontendRequestsAreStateful::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);

        // 2️⃣ Alias middleware "admin" để bảo vệ route admin
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminOnly::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    // 👇 3️⃣ Đăng ký EventServiceProvider mới
    ->withProviders([
        EventServiceProvider::class,
    ])
    ->create();
