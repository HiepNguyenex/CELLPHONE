<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;

use App\Providers\EventServiceProvider;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // ❌ Không bật statefulApi khi dùng Bearer giữa Vercel ↔ Render
        // $middleware->statefulApi();

        // ✅ Không redirect guest API tới route('login')
        $middleware->redirectGuestsTo(function (Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return null; // => sẽ 401 JSON
            }
            return null;     // không có trang login web
        });

        // ✅ Alias
        $middleware->alias([
            'admin' => \App\Http\Middleware\AdminOnly::class,
            'auth'  => \App\Http\Middleware\Authenticate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // ✅ Bắt riêng AuthenticationException để không gọi route('login')
        $exceptions->renderable(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            // Không có trang login web => cũng không redirect
            return response()->json(['message' => 'Unauthenticated.'], 401);
        });
    })
    ->withProviders([
        EventServiceProvider::class,
    ])
    ->create();
