<?php

return [
    // Thời gian sống (TTL) của phiên chat tính bằng phút
    'ttl_minutes' => env('CHAT_TTL_MINUTES', 120),

    // Số lượng tin nhắn lịch sử được load khi lấy hội thoại
    'max_history' => env('CHAT_MAX_HISTORY', 4),
];
