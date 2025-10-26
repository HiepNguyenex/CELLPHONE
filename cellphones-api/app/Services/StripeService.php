<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripeService
{
    public static function createCheckout($order)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        // ✅ Tự động chọn đúng URL frontend theo môi trường
        $frontend = rtrim(config('app.frontend_url'), '/');

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'vnd',
                    'product_data' => [
                        'name' => 'Thanh toán đơn hàng #' . ($order->code ?? $order->id),
                    ],
                    'unit_amount' => (int) $order->total,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => "{$frontend}/payment/result?order_id={$order->id}&ok=1",
            'cancel_url'  => "{$frontend}/payment/result?order_id={$order->id}&ok=0",
            'metadata' => [
                'order_id' => $order->id,
            ],
        ]);

        return $session->url;
    }
}
