<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     * For API requests, return null to trigger 401 JSON instead of redirect.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Nếu là API hoặc client yêu cầu JSON -> không redirect
        if ($request->expectsJson() || $request->is('api/*')) {
            return null; // -> Laravel sẽ trả 401 JSON
        }

        // Nếu bạn có trang login web thì trả về route('login'), còn không thì cứ null
        return null;
    }
}
