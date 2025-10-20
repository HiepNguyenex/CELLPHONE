<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\VNPay;
use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Events\OrderStatusChanged;

class PaymentController extends Controller
{
    public function vnpayCreate(Request $r)
    {
        $data = $r->validate([
            'order_id' => ['required', 'integer', 'exists:orders,id'],
        ]);

        $order = Order::findOrFail($data['order_id']);

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Đơn hàng đã được thanh toán'], 422);
        }

        $nowVN = Carbon::now(config('app.timezone', 'Asia/Ho_Chi_Minh'));

        $params = [
            'vnp_Version'     => config('vnpay.version', '2.1.0'),
            'vnp_TmnCode'     => config('vnpay.tmn_code'),
            'vnp_Amount'      => ((int)$order->total) * 100,
            'vnp_Command'     => 'pay',
            'vnp_CreateDate'  => $nowVN->format('YmdHis'),
            'vnp_CurrCode'    => config('vnpay.curr_code', 'VND'),
            'vnp_IpAddr'      => $r->ip(),
            'vnp_Locale'      => config('vnpay.locale', 'vn'),
            'vnp_OrderInfo'   => 'Thanh toán đơn hàng #' . ($order->code ?? $order->id),
            'vnp_OrderType'   => config('vnpay.order_type', 'other'),
            'vnp_ReturnUrl'   => config('vnpay.return_url'),
            'vnp_TxnRef'      => ($order->code ?? ('ORD' . $order->id)),
            'vnp_ExpireDate'  => $nowVN->copy()->addMinutes(30)->format('YmdHis'),
        ];

        $url = VNPay::createPaymentUrl($params);

        $order->update([
            'payment_method' => 'vnpay',
            'payment_note'   => 'Redirected to VNPay at ' . now(),
        ]);

        return response()->json(['pay_url' => $url]);
    }

    public function vnpayReturn(Request $r)
    {
        $data = $r->all();

        if (empty($data['vnp_TxnRef'])) {
            return response('Missing vnp_TxnRef', 400);
        }

        if (!VNPay::verify($data)) {
            return response('Checksum failed', 400);
        }

        $order = Order::where('code', $data['vnp_TxnRef'])->first();
        if (!$order) {
            return response('Order not found', 404);
        }

        $success = ($data['vnp_ResponseCode'] ?? '') === '00'
            && ($data['vnp_TransactionStatus'] ?? '') === '00';

        $frontendUrl = config('app.frontend_url', 'http://127.0.0.1:5173');

        return redirect()->away("{$frontendUrl}/payment/result?order_id={$order->id}&ok=" . ($success ? '1' : '0'));
    }

    public function vnpayIpn(Request $r)
    {
        $data = $r->all();

        if (!VNPay::verify($data)) {
            return response()->json(['RspCode' => '97', 'Message' => 'Checksum failed']);
        }

        $code   = $data['vnp_TxnRef'] ?? null;
        $trans  = $data['vnp_TransactionNo'] ?? null;
        $resp   = $data['vnp_ResponseCode'] ?? null;
        $stat   = $data['vnp_TransactionStatus'] ?? null;
        $amount = (int) ($data['vnp_Amount'] ?? 0) / 100;

        $order = Order::where('code', $code)->first();
        if (!$order) {
            return response()->json(['RspCode' => '01', 'Message' => 'Order not found']);
        }

        if ((int)$order->total !== (int)$amount) {
            return response()->json(['RspCode' => '04', 'Message' => 'Invalid amount']);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['RspCode' => '00', 'Message' => 'Already paid']);
        }

        if ($resp === '00' && $stat === '00') {
            $from = $order->status;

            $order->update([
                'payment_status'  => 'paid',
                'payment_method'  => 'vnpay',
                'payment_code'    => $trans,
                'payment_paid_at' => now(),
                'payment_note'    => 'VNPay OK',
                'status'          => $from === 'pending' ? 'processing' : $from,
            ]);

            event(new OrderStatusChanged($order, $from, $order->status, 'VNPay payment successful'));

            return response()->json(['RspCode' => '00', 'Message' => 'Success']);
        }

        $order->update([
            'payment_status' => 'failed',
            'payment_method' => 'vnpay',
            'payment_note'   => 'VNPay failed: ' . $resp . '/' . $stat,
        ]);

        return response()->json(['RspCode' => '00', 'Message' => 'Recorded as failed']);
    }
}
