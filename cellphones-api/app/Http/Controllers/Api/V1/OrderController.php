<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderItemAddon;
use App\Models\Product;
use App\Models\WarrantyPlan;
use App\Models\FlashSaleItem;
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

    private function getActiveFlashSaleItem(int $productId): ?FlashSaleItem
    {
        $now = now('Asia/Ho_Chi_Minh');

        $startCol = Schema::hasColumn('flash_sales', 'starts_at') ? 'starts_at'
                  : (Schema::hasColumn('flash_sales', 'start_time') ? 'start_time' : null);
        $endCol   = Schema::hasColumn('flash_sales', 'ends_at')   ? 'ends_at'
                  : (Schema::hasColumn('flash_sales', 'end_time')   ? 'end_time'   : null);

        if (!$startCol || !$endCol) return null;

        return FlashSaleItem::with('flashSale')
            ->where('product_id', $productId)
            ->whereHas('flashSale', function ($q) use ($now, $startCol, $endCol) {
                if (Schema::hasColumn('flash_sales', 'is_active')) {
                    $q->where('is_active', true);
                }
                $q->where($startCol, '<=', $now)
                  ->where($endCol,   '>=', $now);
            })
            ->first();
    }

    private function priceWithFlash(?FlashSaleItem $item, int|float $originPrice): int
    {
        if (!$item) return (int) $originPrice;
        if (!is_null($item->sale_price)) return (int) $item->sale_price;
        if (!is_null($item->discount_percent) && $item->discount_percent > 0) {
            return (int) round($originPrice * (1 - $item->discount_percent / 100));
        }
        return (int) $originPrice;
    }

    /* ==========================================================
     |  QUOTE
     * ==========================================================*/
    public function quote(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            // ✅ chấp nhận id hoặc product_id
            'items.*.product_id' => ['required_without:items.*.id','integer','exists:products,id'],
            'items.*.id'         => ['required_without:items.*.product_id','integer','exists:products,id'],
            'items.*.qty'        => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.addons'     => ['nullable', 'array'],
            'items.*.addons.*'   => ['integer', 'min:1'],
            'shipping_method'    => ['nullable', Rule::in(['standard', 'express'])],
            'coupon'             => ['nullable', 'string', 'max:50'],
        ]);

        // Lấy toàn bộ product ids từ cả 2 field
        $ids = collect($data['items'])->map(fn($r) => $r['product_id'] ?? $r['id'])->unique();
        $products = Product::whereIn('id', $ids)->get(['id', 'price'])->keyBy('id');

        $subtotalProducts = 0;
        $subtotalAddons   = 0;

        $activeCol = Schema::hasColumn('warranty_plans', 'is_active') ? 'is_active'
                   : (Schema::hasColumn('warranty_plans', 'active') ? 'active' : null);

        foreach ($data['items'] as $r) {
            $pid     = (int) ($r['product_id'] ?? $r['id']);
            $product = $products[$pid];
            $origin  = (int) $product->price;

            $fsItem  = $this->getActiveFlashSaleItem($pid);
            $price   = $this->priceWithFlash($fsItem, $origin);

            $qty = (int) $r['qty'];
            $subtotalProducts += (int) $price * $qty;

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

    /* ==========================================================
     |  STORE
     * ==========================================================*/
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required_without:items.*.id','integer','exists:products,id'],
            'items.*.id'         => ['required_without:items.*.product_id','integer','exists:products,id'],
            'items.*.qty'        => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.addons'     => ['nullable', 'array'],
            'items.*.addons.*'   => ['integer', 'min:1'],
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
            $ids = collect($data['items'])->map(fn($r) => $r['product_id'] ?? $r['id'])->unique();
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

            $activeCol = Schema::hasColumn('warranty_plans', 'is_active') ? 'is_active'
                       : (Schema::hasColumn('warranty_plans', 'active') ? 'active' : null);

            foreach ($data['items'] as $row) {
                $pid = (int) ($row['product_id'] ?? $row['id']);
                $p   = $products[$pid];
                $qty = (int) $row['qty'];

                $origin = (int) $p->price;
                $fsItem = $this->getActiveFlashSaleItem($pid);
                $price  = $this->priceWithFlash($fsItem, $origin);

                $affected = Product::where('id', $pid)
                    ->where('stock', '>=', $qty)
                    ->decrement('stock', $qty);
                if ($affected === 0) {
                    throw new \Exception("Sản phẩm {$p->name} không đủ tồn kho");
                }

                $line = (int) $price * $qty;
                $subtotalProducts += $line;

                $orderItem = $order->items()->create([
                    'product_id' => $pid,
                    'name'       => $p->name,
                    'price'      => (int) $price,
                    'qty'        => $qty,
                    'image_url'  => $p->image_url,
                ]);

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

    /* ==========================================================
     |  OTHERS
     * ==========================================================*/
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
