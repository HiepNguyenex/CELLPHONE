<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

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
        // ✅ Bật Sanctum cross-domain cho Render <-> Vercel
        $middleware->statefulApi();

        // ⚡ Không override nhóm api thủ công nữa!
        // Laravel tự thêm EnsureFrontendRequestsAreStateful đúng chỗ

        // ✅ Alias middleware admin
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminOnly::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->withProviders([
        EventServiceProvider::class,
    ])
    ->create();
