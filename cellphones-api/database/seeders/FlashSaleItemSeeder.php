<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\FlashSale;
use App\Models\FlashSaleItem;

class FlashSaleItemSeeder extends Seeder
{
    public function run(): void
    {
        // 🔍 Lấy đợt Flash Sale đầu tiên hoặc tạo mới nếu chưa có
        $flashSale = FlashSale::first();
        if (!$flashSale) {
            $this->call(FlashSaleSeeder::class);
            $flashSale = FlashSale::first();
        }

        // 🎯 Chọn 8 sản phẩm ngẫu nhiên
        $products = Product::inRandomOrder()->take(8)->get();

        foreach ($products as $product) {
            FlashSaleItem::updateOrCreate(
                [
                    'flash_sale_id' => $flashSale->id,
                    'product_id'    => $product->id,
                ],
                [
                    'sale_price'       => round($product->price * 0.85, 0), // ✅ Làm tròn giá giảm
                    'discount_percent' => 15,
                    'is_active'        => true,
                ]
            );
        }

        echo "✅ Seeded " . count($products) . " flash sale items for flash sale ID: {$flashSale->id}.\n";
    }
}
