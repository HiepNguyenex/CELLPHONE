<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

// ⬇️ import các event/listener bạn dùng
use Illuminate\Auth\Events\Registered;
use App\Listeners\CreateDefaultChatSession;

use App\Events\OrderStatusChanged;
use App\Listeners\SendOrderStatusEmail;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Map sự kiện -> listener.
     */
    protected $listen = [
        // Khi user đăng ký xong, tự tạo một phiên chat mặc định cho tài khoản đó
        Registered::class => [
            CreateDefaultChatSession::class,
        ],

        // Sự kiện đơn hàng (giữ nguyên như bạn đang dùng)
        OrderStatusChanged::class => [
            SendOrderStatusEmail::class,
        ],
    ];

    /**
     * Boot events (không cần gì thêm trên Laravel 10+).
     */
    public function boot(): void
    {
        //
    }
}
