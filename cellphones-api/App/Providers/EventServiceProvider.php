<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Đăng ký các sự kiện và listener
     */
    protected $listen = [
        \App\Events\OrderStatusChanged::class => [
            \App\Listeners\SendOrderStatusEmail::class,
        ],
    ];

    /**
     * Boot các event
     */
    public function boot(): void
    {
        parent::boot();
    }
}
