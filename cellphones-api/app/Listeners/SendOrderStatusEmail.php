<?php

namespace App\Listeners;

use App\Events\OrderStatusChanged;
use App\Mail\OrderStatusChangedMail;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendOrderStatusEmail implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Xử lý event OrderStatusChanged.
     */
    public function handle(OrderStatusChanged $e): void
    {
        $mailable = new OrderStatusChangedMail($e->order, $e->from, $e->to, $e->note);

        // Nếu hoàn tất, đính kèm hóa đơn PDF
        if ($e->to === 'completed') {
            $pdf = Pdf::loadView('pdf.invoice', ['order' => $e->order])->setPaper('a4');
            $mailable->attachData(
                $pdf->output(),
                'invoice-' . ($e->order->code ?? $e->order->id) . '.pdf',
                ['mime' => 'application/pdf']
            );
        }

        if ($e->order->email) {
            Mail::to($e->order->email)->queue($mailable);
        }
    }
}
