<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class OrderStatusChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $fromStatus,
        public string $toStatus,
        public ?string $note = null
    ) {}

    public function build()
    {
        return $this->subject(
                'Cập nhật đơn #' . ($this->order->code ?? $this->order->id) . ': ' . $this->toStatus
            )
            ->markdown('emails.orders.status_changed', [
                // 👇 Đổi key cho khớp với Blade
                'order'       => $this->order,
                'fromStatus'  => $this->fromStatus,
                'toStatus'    => $this->toStatus,
                'note'        => $this->note,
            ]);
    }
}
