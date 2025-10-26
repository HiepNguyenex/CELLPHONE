<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\FlashSale;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // ✅ Thêm để fix lỗi Log
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use App\Events\OrderStatusChanged;
use App\Services\StripeService;
use App\Services\VNPay;

class OrderController extends Controller
{
    // ========================
    // 🧮 BÁO GIÁ TRƯỚC CHECKOUT
    // ========================
    public function quote(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id'  => ['required', 'integer', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:99'],
            'shipping_method' => ['nullable', Rule::in(['standard', 'express'])],
            'coupon'          => ['nullable', 'string', 'max:50'],
        ]);

        $ids = collect($data['items'])->pluck('id')->unique();
        $products = Product::whereIn('id', $ids)->get(['id', 'price'])->keyBy('id');

        $subtotal = 0;
        foreach ($data['items'] as $r) {
            $product = $products[$r['id']];
            $price = $product->price;

            // ⚡ Flash Sale
            $flash = FlashSale::where('product_id', $product->id)
                ->where('start_time', '<=', now())
                ->where('end_time', '>=', now())
                ->first();

            if ($flash) {
                $price = $price * (1 - $flash->discount_percent / 100);
            }

            $subtotal += (int)$price * (int)$r['qty'];
        }

        $method   = $data['shipping_method'] ?? 'standard';
        $shipping = $method === 'express' ? 50000 : 30000;
        if ($subtotal >= 2000000) $shipping = 0;

        // ✅ Mã giảm giá
        $discount = 0;
        $couponCode = null;
        if (!empty($data['coupon'])) {
            $coupon = Coupon::where('code', strtoupper($data['coupon']))->first();
            if (!$coupon || !$coupon->isValid()) {
                return response()->json(['message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn.'], 422);
            }
            $discount = (int)round($subtotal * ($coupon->discount / 100));
            $couponCode = $coupon->code;
        }

        $total = max($subtotal + $shipping - $discount, 0);

        return response()->json([
            'subtotal'    => $subtotal,
            'shipping'    => $shipping,
            'discount'    => $discount,
            'total'       => $total,
            'coupon_code' => $couponCode,
        ]);
    }

    // ========================
    // 🧾 TẠO ĐƠN HÀNG MỚI
    // ========================
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id'  => ['required', 'integer', 'exists:products,id'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:99'],

            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['nullable', 'email', 'max:255'],
            'phone'   => ['required', 'string', 'max:30'],
            'address' => ['required', 'string', 'max:500'],

            'shipping_method' => ['required', Rule::in(['standard', 'express'])],
            // ✅ Cho phép thêm stripe
            'payment_method'  => ['required', Rule::in(['cod', 'vnpay', 'stripe'])],
            'coupon'          => ['nullable', 'string', 'max:50'],
            'note'            => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($data, $user) {
            $ids = collect($data['items'])->pluck('id')->unique();
            $products = Product::whereIn('id', $ids)
                ->get(['id', 'name', 'price', 'stock', 'image_url'])
                ->keyBy('id');

            $subtotal = 0;
            $rows = [];

            foreach ($data['items'] as $row) {
                $p   = $products[$row['id']];
                $qty = (int)$row['qty'];

                // ⚡ Flash Sale
                $price = $p->price;
                $flash = FlashSale::where('product_id', $p->id)
                    ->where('start_time', '<=', now())
                    ->where('end_time', '>=', now())
                    ->first();

                if ($flash) {
                    $price = $price * (1 - $flash->discount_percent / 100);
                }

                // ✅ Giảm tồn kho
                $affected = Product::where('id', $p->id)
                    ->where('stock', '>=', $qty)
                    ->decrement('stock', $qty);

                if ($affected === 0) {
                    throw new \Exception("Sản phẩm {$p->name} không đủ tồn kho");
                }

                $subtotal += $price * $qty;

                $rows[] = [
                    'product_id' => $p->id,
                    'name'       => $p->name,
                    'price'      => $price,
                    'qty'        => $qty,
                    'image_url'  => $p->image_url,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $method   = $data['shipping_method'];
            $shipping = $method === 'express' ? 50000 : 30000;
            if ($subtotal >= 2000000) $shipping = 0;

            // ✅ Coupon
            $discount   = 0;
            $couponCode = null;
            $coupon     = null;
            if (!empty($data['coupon'])) {
                $coupon = Coupon::where('code', strtoupper($data['coupon']))->lockForUpdate()->first();
                if (!$coupon || !$coupon->isValid()) {
                    return response()->json(['message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn.'], 422);
                }
                $discount   = (int)round($subtotal * ($coupon->discount / 100));
                $couponCode = $coupon->code;
            }

            $total = max($subtotal + $shipping - $discount, 0);
            $code  = 'ORD' . now()->format('Ymd') . strtoupper(Str::random(6));

            $order = Order::create([
                'user_id'         => $user->id,
                'code'            => $code,
                'name'            => $data['name'],
                'email'           => $data['email'] ?? null,
                'phone'           => $data['phone'],
                'address'         => $data['address'],
                'subtotal'        => $subtotal,
                'shipping'        => $shipping,
                'discount'        => $discount,
                'total'           => $total,
                'status'          => 'pending',
                'note'            => $data['note'] ?? null,
                'payment_method'  => $data['payment_method'],
                'payment_status'  => 'unpaid',
                'shipping_method' => $method,
                'coupon_code'     => $couponCode,
            ]);

            $order->items()->createMany($rows);

            // ✅ nếu có coupon thì trừ lượt dùng
            if ($coupon) {
                $coupon->markUsed();
            }

            $resp = [
                'message' => 'Đặt hàng thành công',
                'order'   => $order->load('items'),
            ];

            // 💳 VNPay
            if ($order->payment_method === 'vnpay') {
                $params = [
                    'vnp_Version'    => '2.1.0',
                    'vnp_TmnCode'    => config('vnpay.tmn_code'),
                    'vnp_Amount'     => ((int)$order->total) * 100,
                    'vnp_Command'    => 'pay',
                    'vnp_CreateDate' => now()->format('YmdHis'),
                    'vnp_CurrCode'   => 'VND',
                    'vnp_IpAddr'     => request()->ip(),
                    'vnp_Locale'     => 'vn',
                    'vnp_OrderInfo'  => 'Thanh toán đơn #' . ($order->code ?? $order->id),
                    'vnp_OrderType'  => 'other',
                    'vnp_ReturnUrl'  => config('vnpay.return_url'),
                    'vnp_TxnRef'     => ($order->code ?? ('ORD'.$order->id)),
                    'vnp_ExpireDate' => now()->addMinutes(15)->format('YmdHis'),
                ];

                $resp['pay_url'] = VNPay::createPaymentUrl($params);
            }

            // 💳 Stripe
            if ($order->payment_method === 'stripe') {
                try {
                    $resp['pay_url'] = StripeService::createCheckout($order);
                } catch (\Exception $e) {
                    Log::error('Stripe session error: ' . $e->getMessage()); // ✅ Đã fix lỗi Log
                    $resp['message'] = 'Không tạo được phiên thanh toán Stripe.';
                }
            }

            return response()->json($resp, 201);
        });
    }

    // ========================
    // 🛑 HỦY ĐƠN HÀNG
    // ========================
    public function cancel(Request $request, $id)
    {
        $order = Order::with('items')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if (!in_array($order->status, ['pending', 'processing'])) {
            return response()->json(['message' => 'Không thể hủy đơn ở trạng thái hiện tại'], 422);
        }

        DB::transaction(function () use ($order) {
            if ($order->status !== 'canceled') {
                foreach ($order->items as $it) {
                    Product::whereKey($it->product_id)->increment('stock', $it->qty);
                }
            }

            $from = $order->status;
            $order->status = 'canceled';
            $order->save();

            OrderStatusChanged::dispatch($order, $from, 'canceled', 'Khách hủy đơn');
        });

        return response()->json(['success' => true]);
    }

    // ========================
    // 📦 LẤY DANH SÁCH ĐƠN
    // ========================
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with('items')
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    // ========================
    // 📄 CHI TIẾT ĐƠN HÀNG
    // ========================
    public function show(Request $request, $id)
    {
        $order = $request->user()
            ->orders()
            ->with('items')
            ->findOrFail($id);

        return response()->json($order);
    }
}
