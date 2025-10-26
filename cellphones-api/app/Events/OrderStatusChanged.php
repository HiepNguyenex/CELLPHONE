<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged
{
    use Dispatchable, SerializesModels;

    /**
     * Tạo event khi trạng thái đơn hàng thay đổi.
     *
     * @param  \App\Models\Order  $order
     * @param  string  $from
     * @param  string  $to
     * @param  string|null  $note
     */
    public function __construct(
        public Order $order,
        public string $from,
        public string $to,
        public ?string $note = null
    ) {}
}
