<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use App\Events\OrderStatusChanged;

class OrderController extends Controller
{
    // 🧹 GIỮ NGUYÊN - POST /api/v1/checkout/quote
    public function quote(Request $request)
    {
        $data = $request->validate([
            'items' => ['required','array','min:1'],
            'items.*.id'  => ['required','integer','exists:products,id'],
            'items.*.qty' => ['required','integer','min:1','max:99'],
            'shipping_method' => ['nullable', Rule::in(['standard','express'])],
            'coupon'          => ['nullable','string','max:50'],
        ]);

        $ids = collect($data['items'])->pluck('id')->unique();
        $products = Product::whereIn('id', $ids)->get(['id','price'])->keyBy('id');

        $subtotal = 0;
        foreach ($data['items'] as $r) {
            $subtotal += (int)$products[$r['id']]->price * (int)$r['qty'];
        }

        $method   = $data['shipping_method'] ?? 'standard';
        $shipping = $method === 'express' ? 50000 : 30000;
        if ($subtotal >= 2000000) $shipping = 0;

        $discount = 0;
        if (!empty($data['coupon']) && strtoupper($data['coupon']) === 'SALE10') {
            $discount = min((int)round($subtotal * 0.10), 200000);
        }

        $total = max($subtotal + $shipping - $discount, 0);

        return response()->json(compact('subtotal','shipping','discount','total'));
    }

    // ⚡ SỬA - POST /api/v1/orders (tích hợp VNPay)
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required','array','min:1'],
            'items.*.id'  => ['required','integer','exists:products,id'],
            'items.*.qty' => ['required','integer','min:1','max:99'],

            'name'    => ['required','string','max:255'],
            'email'   => ['nullable','email','max:255'],
            'phone'   => ['required','string','max:30'],
            'address' => ['required','string','max:500'],

            'shipping_method' => ['required', Rule::in(['standard','express'])],
            'payment_method'  => ['required', Rule::in(['cod','vnpay'])], // ⚡ SỬA - thêm vnpay
            'coupon'          => ['nullable','string','max:50'],
            'note'            => ['nullable','string','max:500'],
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($data, $user) {
            $ids = collect($data['items'])->pluck('id')->unique();
            $products = Product::whereIn('id', $ids)
                ->get(['id','name','price','stock','image_url'])
                ->keyBy('id');

            $subtotal = 0;
            $rows = [];

            foreach ($data['items'] as $row) {
                $p    = $products[$row['id']];
                $qty  = (int)$row['qty'];
                $price= (int)$p->price;

                $affected = Product::where('id', $p->id)
                    ->where('stock','>=',$qty)
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

            $discount = 0;
            if (!empty($data['coupon']) && strtoupper($data['coupon']) === 'SALE10') {
                $discount = min((int)round($subtotal * 0.10), 200000);
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
                'payment_method'  => $data['payment_method'], // cod | vnpay
                'payment_status'  => 'unpaid',                // ✅ THÊM - cần có cột này
                'shipping_method' => $method,
            ]);

            $order->items()->createMany($rows);

            // ✅ Bổ sung phần tạo URL thanh toán VNPay nếu chọn VNPay
            $resp = [
                'message' => 'Đặt hàng thành công',
                'order'   => $order->load('items'),
            ];

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

                // Gọi service để tạo link thanh toán
                $resp['pay_url'] = \App\Services\VNPay::createPaymentUrl($params);
            }

            return response()->json($resp, 201);
        });
    }

    // 🧹 GIỮ NGUYÊN - HỦY ĐƠN HÀNG
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

    // 🧹 GIỮ NGUYÊN - GET /api/v1/orders
    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with('items')
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    // 🧹 GIỮ NGUYÊN - GET /api/v1/orders/{id}
    public function show(Request $request, $id)
    {
        $order = $request->user()
            ->orders()
            ->with('items')
            ->findOrFail($id);

        return response()->json($order);
    }
}

// === KẾT FILE: app/Http/Controllers/Api/V1/OrderController.php ===
