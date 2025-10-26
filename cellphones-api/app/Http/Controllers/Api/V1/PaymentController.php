<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use App\Models\Order;

class PaymentController extends Controller
{
    /**
     * 💳 Tạo phiên thanh toán Stripe Checkout
     */
    public function stripeCreate(Request $request)
    {
        $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,id'],
        ]);

        $order = Order::findOrFail($request->order_id);

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Đơn hàng đã được thanh toán'], 422);
        }

        Stripe::setApiKey(config('services.stripe.secret'));
        $frontend = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');

        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'vnd',
                        'product_data' => [
                            'name' => 'Thanh toán đơn hàng #' . $order->code,
                        ],
                        'unit_amount' => (int) $order->total,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',

                // ✅ THÊM METADATA ĐỂ WEBHOOK NHẬN ORDER_ID
                'metadata' => [
                    'order_id'   => $order->id,
                    'order_code' => $order->code,
                ],

                // ✅ URL trả về cho FE sau khi thanh toán
                'success_url' => $frontend . '/payment/result?order_id=' . $order->id . '&ok=1',
                'cancel_url'  => $frontend . '/payment/result?order_id=' . $order->id . '&ok=0',
            ]);

            $order->update([
                'payment_method' => 'stripe',
                'payment_note'   => 'Redirected to Stripe at ' . now(),
            ]);

            return response()->json(['pay_url' => $session->url]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Stripe error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * ✅ FE gọi sau khi Stripe redirect
     */
    public function result($id)
    {
        $order = Order::find($id);
        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json([
            'id'             => $order->id,
            'code'           => $order->code,
            'total'          => $order->total,
            'status'         => $order->status,
            'payment_method' => $order->payment_method,
            'payment_status' => $order->payment_status,
            'created_at'     => $order->created_at,
        ]);
    }

    /**
     * ✅ Manual return fallback (ít dùng, dành cho test)
     */
    public function stripeReturn(Request $request)
    {
        $order = Order::find($request->query('order_id'));
        if (!$order) return response('Order not found', 404);

        $order->update([
            'payment_status'  => 'paid',
            'status'          => 'processing',
            'payment_paid_at' => now(),
            'payment_note'    => 'Thanh toán thành công qua Stripe (manual)',
        ]);

        return response()->json(['message' => 'Payment success']);
    }
}
