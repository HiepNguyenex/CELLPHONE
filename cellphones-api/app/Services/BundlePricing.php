<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema; // ✅ THÊM DÒNG NÀY
/**
 * Tính giá mua kèm (bundle).
 * - Lấy danh sách bundle từ quan hệ $product->bundles() (pivot: discount_percent, active).
 * - Tính total combo, savings, và giá từng item sau giảm.
 */
class BundlePricing
{
    /**
     * Trả danh sách combo (mỗi combo là base + 1 sản phẩm mua kèm).
     *
     * @param  Product  $product   Sản phẩm chính
     * @param  bool     $onlyActiveChained  chỉ lấy pivot active
     * @return array[
     *   [
     *     'bundle_product' => Product,
     *     'discount_percent' => int,
     *     'base_price' => int,
     *     'bundle_item_price_before' => int,
     *     'bundle_item_price_after' => int,
     *     'combo_total' => int,
     *     'saving' => int
     *   ],
     *   ...
     * ]
     */
    public function combos(Product $product, bool $onlyActiveChained = true): array
    {
        $basePrice = $this->finalPriceOf($product);

        $q = $product->bundles()->with(['brand:id,name', 'category:id,name']);
        if ($onlyActiveChained && $this->hasPivotColumn()) {
            $q->wherePivot('active', 1);
        }
        /** @var Collection<Product> $bundleItems */
        $bundleItems = $q->take(10)->get();

        $out = [];
        foreach ($bundleItems as $bp) {
            $bpPrice = $this->finalPriceOf($bp);
            $percent = (int) ($bp->pivot->discount_percent ?? 0);
            $bpAfter = $this->applyPercent($bpPrice, $percent);

            $comboTotal = $basePrice + $bpAfter;
            $saving = max(0, ($basePrice + $bpPrice) - $comboTotal);

            $out[] = [
                'bundle_product' => $bp,
                'discount_percent' => $percent,
                'base_price' => (int) $basePrice,
                'bundle_item_price_before' => (int) $bpPrice,
                'bundle_item_price_after' => (int) $bpAfter,
                'combo_total' => (int) $comboTotal,
                'saving' => (int) $saving,
            ];
        }

        return $out;
    }

    /**
     * Tính tổng cho một combo tuỳ biến: base + danh sách id/percent tự chỉ định (nếu bạn muốn build nhiều-item).
     * $items = [
     *   ['product' => Product|int, 'percent' => 10],
     *   ...
     * ]
     */
    public function customCombo(Product $base, array $items): array
    {
        $basePrice = $this->finalPriceOf($base);

        $total = $basePrice;
        $saving = 0;
        $normalized = [];

        foreach ($items as $it) {
            $p = $it['product'];
            if (!$p instanceof Product) {
                $p = Product::find($p);
            }
            if (!$p) continue;

            $percent = (int) ($it['percent'] ?? 0);
            $priceBefore = $this->finalPriceOf($p);
            $priceAfter  = $this->applyPercent($priceBefore, $percent);

            $total  += $priceAfter;
            $saving += max(0, $priceBefore - $priceAfter);

            $normalized[] = [
                'product' => $p,
                'percent' => $percent,
                'price_before' => (int) $priceBefore,
                'price_after'  => (int) $priceAfter,
            ];
        }

        return [
            'base' => [
                'product' => $base,
                'price'   => (int) $basePrice,
            ],
            'items' => $normalized,
            'combo_total' => (int) $total,
            'saving' => (int) $saving,
        ];
    }

    // ----------------------- helpers -----------------------

    /**
     * Lấy final price: ưu tiên sale_price nếu set, fallback price.
     */
    protected function finalPriceOf(Product $p): int
    {
        $price = $p->sale_price ?? null;
        if ($price === null) {
            $price = $p->price ?? 0;
        }
        return (int) $price;
    }

    protected function applyPercent(float $price, int $percent): int
    {
        $percent = max(0, min(100, $percent));
        $after = $price * (100 - $percent) / 100;
        return (int) round($after);
    }

    protected function hasPivotColumn(): bool
    {
        try {
            return Schema::hasColumn('product_bundle', 'active'); // ✅ dùng Facade đã import
        } catch (\Throwable $e) {
            return false;
        }
    }
}