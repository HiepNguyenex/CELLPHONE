    <?php

    namespace App\Http\Controllers\Api\V1;

    use App\Http\Controllers\Controller;
    use App\Models\Order;
    use App\Services\VNPay;
    use Illuminate\Http\Request;
    use App\Events\OrderStatusChanged;

    class PaymentController extends Controller
    {
        /**
         * POST /api/v1/payment/vnpay/create
         * Body: { order_id: number }
         * -> tạo URL thanh toán và trả về { pay_url }
         */
        public function vnpayCreate(Request $r)
        {
            $data = $r->validate([
                'order_id' => ['required', 'integer', 'exists:orders,id'],
            ]);

            $order = Order::where('id', $data['order_id'])
                ->where('user_id', $r->user()->id)
                ->firstOrFail();

            if ($order->payment_status === 'paid') {
                return response()->json(['message' => 'Đơn đã thanh toán'], 422);
            }

            // Build VNPay params
            $vnp_TmnCode   = config('vnpay.tmn_code');
            $vnp_ReturnUrl = config('vnpay.return_url');
            $vnp_IpnUrl    = config('vnpay.ipn_url');

            $amount = (int) $order->total * 100; // VNPay yêu cầu x100

            $params = [
                'vnp_Version'     => '2.1.0',
                'vnp_TmnCode'     => $vnp_TmnCode,
                'vnp_Amount'      => $amount,
                'vnp_Command'     => 'pay',
                'vnp_CreateDate'  => now()->format('YmdHis'),
                'vnp_CurrCode'    => 'VND',
                'vnp_IpAddr'      => $r->ip(),
                'vnp_Locale'      => 'vn',
                'vnp_OrderInfo'   => 'Thanh toán đơn #' . ($order->code ?? $order->id),
                'vnp_OrderType'   => 'other',
                'vnp_ReturnUrl'   => $vnp_ReturnUrl,
                'vnp_TxnRef'      => ($order->code ?? ('ORD' . $order->id)),
                'vnp_ExpireDate'  => now()->addMinutes(15)->format('YmdHis'),
                'vnp_Bill_Mobile' => $order->phone,
                'vnp_Inv_Email'   => $order->email,
                'vnp_IpnUrl'      => $vnp_IpnUrl, // optional
            ];

            $url = VNPay::createPaymentUrl($params);

            $order->update([
                'payment_method' => 'vnpay',
                'payment_note'   => 'Redirected to VNPay at ' . now(),
            ]);

            return response()->json(['pay_url' => $url]);
        }

        /**
         * GET|POST /api/v1/payment/vnpay/return
         * Người dùng được VNPay redirect về đây.
         * -> xác thực và redirect về FE /payment/result
         */
        public function vnpayReturn(Request $r)
        {
            $all = $r->all();

            if (!isset($all['vnp_TxnRef'])) {
                return response('Missing data', 400);
            }

            if (!VNPay::verify($all)) {
                return response('Checksum failed', 400);
            }

            $order = Order::where('code', $all['vnp_TxnRef'])->first();
            if (!$order) {
                return response('Order not found', 404);
            }

            $success = ($all['vnp_ResponseCode'] ?? '') === '00'
                && ($all['vnp_TransactionStatus'] ?? '') === '00';

            // ⚡ SỬA: redirect về FE trang kết quả thanh toán
            return redirect()->away(
                config('app.frontend_url', 'http://127.0.0.1:5173') .
                '/payment/result?order_id=' . $order->id .
                '&ok=' . ($success ? '1' : '0')
            );
        }

        /**
         * GET|POST /api/v1/payment/vnpay/ipn
         * VNPay server gọi vào để thông báo kết quả – verify & cập nhật DB.
         */
        public function vnpayIpn(Request $r)
        {
            $all = $r->all();

            if (!VNPay::verify($all)) {
                return response()->json(['RspCode' => '97', 'Message' => 'Checksum failed']);
            }

            $code   = $all['vnp_TxnRef'] ?? null;
            $trans  = $all['vnp_TransactionNo'] ?? null;
            $resp   = $all['vnp_ResponseCode'] ?? null;
            $stat   = $all['vnp_TransactionStatus'] ?? null;
            $amount = (int) ($all['vnp_Amount'] ?? 0) / 100;

            $order = Order::where('code', $code)->first();
            if (!$order) {
                return response()->json(['RspCode' => '01', 'Message' => 'Order not found']);
            }

            if ((int) $order->total !== (int) $amount) {
                return response()->json(['RspCode' => '04', 'Message' => 'Invalid amount']);
            }

            // Idempotent
            if ($order->payment_status === 'paid') {
                return response()->json(['RspCode' => '00', 'Message' => 'Already paid']);
            }

            // Thành công khi ResponseCode=00 và TransactionStatus=00
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

                event(new OrderStatusChanged($order, $from, $order->status, 'VNPay paid'));

                return response()->json(['RspCode' => '00', 'Message' => 'Success']);
            }

            // Thất bại
            $order->update([
                'payment_status' => 'failed',
                'payment_method' => 'vnpay',
                'payment_note'   => 'VNPay failed: ' . $resp . '/' . $stat,
            ]);

            return response()->json(['RspCode' => '00', 'Message' => 'Recorded as failed']);
        }
    }
