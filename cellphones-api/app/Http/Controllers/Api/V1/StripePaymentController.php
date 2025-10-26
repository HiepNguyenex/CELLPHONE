<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripePaymentController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
        ]);

        $order = Order::find($request->order_id);
        Stripe::setApiKey(config('services.stripe.secret'));

        $frontend = rtrim(config('app.frontend_url', 'http://127.0.0.1:5173'), '/');


        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'vnd',
                    'product_data' => [
                        'name' => 'Thanh toán đơn hàng #' . $order->id,
                    ],
                    'unit_amount' => (int) $order->total,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => $frontend . '/payment/result?order_id=' . $order->id . '&ok=1',
            'cancel_url'  => $frontend . '/payment/result?order_id=' . $order->id . '&ok=0',
        ]);

        $order->update([
            'payment_method' => 'stripe',
            'payment_note' => 'Đang chờ thanh toán Stripe',
        ]);

        return response()->json([
            'pay_url' => $session->url
        ]);
    }
}
