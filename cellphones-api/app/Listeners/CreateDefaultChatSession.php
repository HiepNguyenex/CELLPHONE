<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Str;
use App\Models\ChatSession;

class CreateDefaultChatSession
{
    public function handle(Registered $event): void
    {
        $user = $event->user;

        // Nếu đã có phiên "open" thì thôi
        $exists = ChatSession::where('user_id', $user->id)
            ->where('status', 'open')
            ->exists();

        if ($exists) return;

        // Tạo mới 1 phiên mặc định
        ChatSession::create([
            'id'               => (string) Str::uuid(),
            'user_id'          => $user->id,
            'status'           => 'open',
            'last_activity_at' => now(),
            'expires_at'       => now()->addMinutes(config('chat.ttl_minutes', 120)),
            'meta'             => [],
        ]);
    }
}
