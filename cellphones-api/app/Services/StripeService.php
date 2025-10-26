<?php

namespace App\Services;

use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripeService
{
    public static function createCheckout($order)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        // ✅ Lấy URL FE động từ .env
        $frontend = rtrim(config('app.frontend_url', 'http://127.0.0.1:5173'), '/');

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
                'order_id' => $order->id, // ✅ Để webhook nhận diện đúng
            ],
        ]);

        return $session->url;
    }
}
