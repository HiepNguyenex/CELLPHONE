<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemAddon;
use App\Models\Product;
use App\Models\WarrantyPlan;
// use App\Models\FlashSale;                            // ⚡ SỬA: bỏ query trực tiếp FlashSale
use App\Models\FlashSaleItem;                           // ✅ THÊM: dùng FlashSaleItem đúng thiết kế
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use App\Events\OrderStatusChanged;
use App\Services\StripeService;
use App\Services\VNPay;

class OrderController extends Controller
{
    /* ==========================================================
     |  Helpers
     * ==========================================================*/

    /**
     * Lấy FlashSaleItem đang active cho 1 product (nếu có).
     * Tự dò tên cột thời gian starts_at/ends_at hoặc start_time/end_time.
     */
    private function getActiveFlashSaleItem(int $productId): ?FlashSaleItem  // ✅ THÊM
    {
        $now = now('Asia/Ho_Chi_Minh');

        // Dò tên cột động trên bảng flash_sales
        $startCol = Schema::hasColumn('flash_sales', 'starts_at') ? 'starts_at'
                  : (Schema::hasColumn('flash_sales', 'start_time') ? 'start_time' : null);
        $endCol   = Schema::hasColumn('flash_sales', 'ends_at')   ? 'ends_at'
                  : (Schema::hasColumn('flash_sales', 'end_time')   ? 'end_time'   : null);

        // Nếu không có cột thời gian, coi như không có flash sale nào hợp lệ
        if (!$startCol || !$endCol) {
            return null;
        }

        return FlashSaleItem::with('flashSale')
            ->where('product_id', $productId)
            ->whereHas('flashSale', function ($q) use ($now, $startCol, $endCol) {
                // is_active nếu có thì bật filter, không có thì bỏ qua
                if (Schema::hasColumn('flash_sales', 'is_active')) {
                    $q->where('is_active', true);
                }
                $q->where($startCol, '<=', $now)
                  ->where($endCol,   '>=', $now);
            })
            ->first();
    }

    /**
     * Trả về đơn giá áp dụng flash sale (nếu có), ưu tiên sale_price,
     * nếu không có thì dùng discount_percent; nếu không có sale thì trả về giá gốc.
     */
    private function priceWithFlash(?FlashSaleItem $item, int|float $originPrice): int  // ✅ THÊM
    {
        if (!$item) return (int) $originPrice;

        if (!is_null($item->sale_price)) {
            return (int) $item->sale_price;
        }

        if (!is_null($item->discount_percent) && $item->discount_percent > 0) {
            return (int) round($originPrice * (1 - $item->discount_percent / 100));
        }

        return (int) $originPrice;
    }

    /* ==========================================================
     |  API
     * ==========================================================*/

    public function quote(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id'       => ['required', 'integer', 'exists:products,id'],
            'items.*.qty'      => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.addons'   => ['nullable', 'array'],
            'items.*.addons.*' => ['integer', 'min:1'],
            'shipping_method'  => ['nullable', Rule::in(['standard', 'express'])],
            'coupon'           => ['nullable', 'string', 'max:50'],
        ]);

        $ids = collect($data['items'])->pluck('id')->unique();
        $products = Product::whereIn('id', $ids)->get(['id', 'price'])->keyBy('id');

        $subtotalProducts = 0;
        $subtotalAddons   = 0;

        // ✅ cột active động
        $activeCol = Schema::hasColumn('warranty_plans', 'is_active') ? 'is_active'
                   : (Schema::hasColumn('warranty_plans', 'active') ? 'active' : null);

        foreach ($data['items'] as $r) {
            $product = $products[$r['id']];
            $origin  = (int) $product->price;

            // ⚡ SỬA: dùng FlashSaleItem + whereHas('flashSale') thay vì query FlashSale trực tiếp
            $fsItem  = $this->getActiveFlashSaleItem($product->id);
            $price   = $this->priceWithFlash($fsItem, $origin);

            $qty = (int) $r['qty'];
            $subtotalProducts += (int) $price * $qty;

            // ✅ nhận mọi plan id active (global/brand/category/product)
            $addonIds = collect($r['addons'] ?? [])->filter()->unique();
            if ($addonIds->isNotEmpty()) {
                $plans = WarrantyPlan::whereIn('id', $addonIds)
                    ->when($activeCol, fn($q) => $q->where($activeCol, true))
                    ->get(['id','price']);

                $subtotalAddons += (int) $plans->sum('price') * $qty;
            }
        }

        $subtotal = $subtotalProducts + $subtotalAddons;
        $method   = $data['shipping_method'] ?? 'standard';
        $shipping = $method === 'express' ? 50000 : 30000;
        if ($subtotal >= 2000000) $shipping = 0;

        $discount = 0;
        $couponCode = null;
        if (!empty($data['coupon'])) {
            $coupon = Coupon::where('code', strtoupper($data['coupon']))->first();
            if (!$coupon || !$coupon->isValid()) {
                return response()->json(['message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn.'], 422);
            }
            $discount = (int) round($subtotal * ($coupon->discount / 100));
            $couponCode = $coupon->code;
        }

        $total = max($subtotal + $shipping - $discount, 0);

        return response()->json([
            'subtotal'      => (int) $subtotal,
            'shipping'      => (int) $shipping,
            'discount'      => (int) $discount,
            'total'         => (int) $total,
            'coupon_code'   => $couponCode,
            'addons_total'  => (int) $subtotalAddons,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id'       => ['required', 'integer', 'exists:products,id'],
            'items.*.qty'      => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.addons'   => ['nullable', 'array'],
            'items.*.addons.*' => ['integer', 'min:1'],
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['nullable', 'email', 'max:255'],
            'phone'   => ['required', 'string', 'max:30'],
            'address' => ['required', 'string', 'max:500'],
            'shipping_method' => ['required', Rule::in(['standard', 'express'])],
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

            $subtotalProducts = 0;
            $subtotalAddons   = 0;

            $order = Order::create([
                'user_id'         => $user->id,
                'code'            => 'ORD' . now()->format('Ymd') . strtoupper(Str::random(6)),
                'name'            => $data['name'],
                'email'           => $data['email'] ?? null,
                'phone'           => $data['phone'],
                'address'         => $data['address'],
                'subtotal'        => 0,
                'shipping'        => 0,
                'discount'        => 0,
                'total'           => 0,
                'status'          => 'pending',
                'note'            => $data['note'] ?? null,
                'payment_method'  => $data['payment_method'],
                'payment_status'  => 'unpaid',
                'shipping_method' => $data['shipping_method'],
                'coupon_code'     => null,
            ]);

            // ✅ cột active động
            $activeCol = Schema::hasColumn('warranty_plans', 'is_active') ? 'is_active'
                       : (Schema::hasColumn('warranty_plans', 'active') ? 'active' : null);

            foreach ($data['items'] as $row) {
                $p   = $products[$row['id']];
                $qty = (int) $row['qty'];

                $origin = (int) $p->price;

                // ⚡ SỬA: dùng FlashSaleItem đúng bảng/cột
                $fsItem = $this->getActiveFlashSaleItem($p->id);
                $price  = $this->priceWithFlash($fsItem, $origin);

                // Trừ kho an toàn
                $affected = Product::where('id', $p->id)
                    ->where('stock', '>=', $qty)
                    ->decrement('stock', $qty);
                if ($affected === 0) {
                    throw new \Exception("Sản phẩm {$p->name} không đủ tồn kho");
                }

                $line = (int) $price * $qty;
                $subtotalProducts += $line;

                $orderItem = $order->items()->create([
                    'product_id' => $p->id,
                    'name'       => $p->name,
                    'price'      => (int) $price,
                    'qty'        => $qty,
                    'image_url'  => $p->image_url,
                ]);

                // ✅ nhận mọi plan id active
                $addonIds = collect($row['addons'] ?? [])->filter()->unique();
                if ($addonIds->isNotEmpty()) {
                    $plans = WarrantyPlan::whereIn('id', $addonIds)
                        ->when($activeCol, fn($q) => $q->where($activeCol, true))
                        ->get(['id','name','type','months','price']);

                    foreach ($plans as $plan) {
                        $subtotalAddons += (int) $plan->price * $qty;

                        OrderItemAddon::create([
                            'order_item_id'    => $orderItem->id,
                            'warranty_plan_id' => $plan->id,
                            'name'             => $plan->name,
                            'type'             => $plan->type,
                            'months'           => $plan->months,
                            'price'            => (int) $plan->price,
                        ]);
                    }
                }
            }

            $subtotal = $subtotalProducts + $subtotalAddons;

            $shipping = $data['shipping_method'] === 'express' ? 50000 : 30000;
            if ($subtotal >= 2000000) $shipping = 0;

            $discount   = 0;
            $couponCode = null;
            $coupon     = null;
            if (!empty($data['coupon'])) {
                $coupon = Coupon::where('code', strtoupper($data['coupon']))->lockForUpdate()->first();
                if (!$coupon || !$coupon->isValid()) {
                    return response()->json(['message' => 'Mã giảm giá không hợp lệ hoặc đã hết hạn.'], 422);
                }
                $discount   = (int) round($subtotal * ($coupon->discount / 100));
                $couponCode = $coupon->code;
            }

            $total = max($subtotal + $shipping - $discount, 0);

            $order->update([
                'subtotal'    => (int) $subtotal,
                'shipping'    => (int) $shipping,
                'discount'    => (int) $discount,
                'total'       => (int) $total,
                'coupon_code' => $couponCode,
            ]);

            if ($coupon) $coupon->markUsed();

            $resp = [
                'message' => 'Đặt hàng thành công',
                'order'   => $order->load(['items.addons']),
            ];

            if ($order->payment_method === 'vnpay') {
                $params = [
                    'vnp_Version'    => '2.1.0',
                    'vnp_TmnCode'    => config('vnpay.tmn_code'),
                    'vnp_Amount'     => ((int) $order->total) * 100,
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

            if ($order->payment_method === 'stripe') {
                try { $resp['pay_url'] = StripeService::createCheckout($order); }
                catch (\Exception $e) {
                    Log::error('Stripe session error: '.$e->getMessage());
                    $resp['message'] = 'Không tạo được phiên thanh toán Stripe.';
                }
            }

            return response()->json($resp, 201);
        });
    }

    public function cancel(Request $request, $id)
    {
        $order = Order::with(['items'])
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

    public function index(Request $request)
    {
        $orders = $request->user()
            ->orders()
            ->with(['items.addons'])
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = $request->user()
            ->orders()
            ->with(['items.addons'])
            ->findOrFail($id);

        return response()->json($order);
    }

    public function checkPurchased(Request $request, $productId)
    {
        $userId = $request->user()->id;

        $hasPurchased = OrderItem::where('product_id', $productId)
            ->whereHas('order', fn($q) => $q->where('user_id', $userId))
            ->exists();

        return response()->json(['purchased' => $hasPurchased]);
    }
}
