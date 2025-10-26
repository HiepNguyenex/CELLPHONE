<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Coupon;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema; // ✅ THÊM DÒNG NÀY

/**
 * Gom các ưu đãi/promotion:
 * - Coupons từ bảng coupons (theo product/category/brand hoặc global)
 * - promotions JSON lưu trên products
 * => Trả về danh sách hợp lệ + phương thức áp dụng tốt nhất.
 */
class PromotionService
{
    /**
     * Lấy danh sách coupon đang hợp lệ cho sản phẩm (và ngữ cảnh tuỳ chọn).
     *
     * @param  Product      $product
     * @param  User|null    $user
     * @param  float|null   $subtotal  (nếu muốn lọc theo min_order_amount)
     * @param  string|null  $code      (nếu người dùng nhập code cụ thể)
     * @return \Illuminate\Support\Collection
     */
    public function eligibleCoupons(Product $product, ?User $user = null, ?float $subtotal = null, ?string $code = null)
    {
        $now = Carbon::now();

        $q = Coupon::query()
            ->where('active', 1)
            ->when($code, fn($qq) => $qq->where('code', $code))
            ->where(function ($qq) use ($product) {
                // Áp cho đúng đối tượng (ưu tiên cụ thể; nếu các cột không tồn tại thì bỏ qua).
                $qq->whereNull('product_id')
                   ->whereNull('category_id')
                   ->whereNull('brand_id');

                // Áp cho product
                $qq->orWhere(function ($qx) use ($product) {
                    if ($this->hasColumn('coupons', 'product_id')) {
                        $qx->where('product_id', $product->id);
                    }
                });

                // Áp cho category
                $qq->orWhere(function ($qx) use ($product) {
                    if ($this->hasColumn('coupons', 'category_id')) {
                        $qx->where('category_id', $product->category_id);
                    }
                });

                // Áp cho brand
                $qq->orWhere(function ($qx) use ($product) {
                    if ($this->hasColumn('coupons', 'brand_id')) {
                        $qx->where('brand_id', $product->brand_id);
                    }
                });
            })
            ->when($this->hasColumn('coupons', 'start_at'), fn($qq) => $qq->where(function ($q2) use ($now) {
                $q2->whereNull('start_at')->orWhere('start_at', '<=', $now);
            }))
            ->when($this->hasColumn('coupons', 'end_at'), fn($qq) => $qq->where(function ($q2) use ($now) {
                $q2->whereNull('end_at')->orWhere('end_at', '>=', $now);
            }))
            ->orderByDesc('priority')
            ->orderBy('id');

        $coupons = $q->get();

        // Lọc min_order_amount, usage_limit_total nếu có
        $coupons = $coupons->filter(function ($c) use ($subtotal) {
            if ($this->hasColumn('coupons', 'min_order_amount') && $c->min_order_amount) {
                if ($subtotal !== null && $subtotal < $c->min_order_amount) {
                    return false;
                }
            }
            if ($this->hasColumn('coupons', 'usage_limit_total') && $this->hasColumn('coupons', 'usage_count')) {
                if ($c->usage_limit_total && $c->usage_count >= $c->usage_limit_total) {
                    return false;
                }
            }
            return true;
        })->values();

        return $coupons;
    }

    /**
     * Áp 1 coupon vào giá.
     *
     * Yêu cầu các cột cơ bản:
     * - type: 'percent'|'fixed'
     * - value: số % hoặc số tiền
     * - max_discount_value (optional): trần giảm cho percent
     */
    public function applyCouponToPrice(float $price, $coupon): array
    {
        if (!$coupon) {
            return [
                'price_before' => (int) round($price),
                'discount'     => 0,
                'price_after'  => (int) round($price),
                'coupon'       => null,
            ];
        }

        $type  = $coupon->type ?? 'percent';
        $value = (float) ($coupon->value ?? 0);

        $discount = 0;
        if ($type === 'fixed') {
            $discount = min($price, max(0, $value));
        } else { // percent
            $discount = $price * max(0, $value) / 100;
            // Trần giảm
            if ($this->hasColumn('coupons', 'max_discount_value') && $coupon->max_discount_value) {
                $discount = min($discount, (float) $coupon->max_discount_value);
            }
        }

        $priceAfter = max(0, $price - $discount);

        return [
            'price_before' => (int) round($price),
            'discount'     => (int) round($discount),
            'price_after'  => (int) round($priceAfter),
            'coupon'       => [
                'id'    => $coupon->id ?? null,
                'code'  => $coupon->code ?? null,
                'type'  => $type,
                'value' => $value,
                'name'  => $coupon->name ?? null,
            ],
        ];
    }

    /**
     * Tìm coupon tốt nhất theo số tiền giảm được.
     */
    public function applyBestCoupon(float $price, $coupons): array
    {
        $best = null;
        $maxDiscount = -1;

        foreach ($coupons as $c) {
            $res = $this->applyCouponToPrice($price, $c);
            if ($res['discount'] > $maxDiscount) {
                $maxDiscount = $res['discount'];
                $best = $res;
            }
        }

        return $best ?: [
            'price_before' => (int) round($price),
            'discount'     => 0,
            'price_after'  => (int) round($price),
            'coupon'       => null,
        ];
    }

    /**
     * Lấy promotions JSON từ product->promotions (ưu đãi hiển thị, không phải luôn là coupon).
     * Trả về mảng đã chuẩn hoá: [{title, type, value, note}, ...]
     */
    public function promotionsFromProduct(Product $product): array
    {
        $arr = [];

        $raw = $product->promotions ?? null;
        if (is_string($raw)) {
            $raw = json_decode($raw, true);
        }

        if (is_array($raw)) {
            foreach ($raw as $item) {
                $arr[] = [
                    'title' => $item['title'] ?? ($item['name'] ?? 'Ưu đãi'),
                    'type'  => $item['type']  ?? 'text',
                    'value' => $item['value'] ?? null,
                    'note'  => $item['note']  ?? null,
                ];
            }
        }

        return $arr;
    }

    /**
     * Helper kiểm tra tồn tại cột để service không nổ nếu schema hơi khác.
     */
    protected function hasColumn(string $table, string $column): bool
    {
        try {
            return Schema::hasColumn($table, $column); // ✅ dùng Facade đã import
        } catch (\Throwable $e) {
            return false;
        }
    }
}
