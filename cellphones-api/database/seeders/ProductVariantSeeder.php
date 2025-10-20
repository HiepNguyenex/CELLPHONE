<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProductVariantSeeder extends Seeder
{
    public function run(): void
    {
        // Tạo biến thể mẫu cho các product phổ biến (dùng heuristics theo category / name)
        // Quy ước:
        //  - Smartphone: biến thể theo dung lượng + màu
        //  - Laptop: biến thể theo RAM + SSD
        //  - Accessories: 1-2 biến thể màu
        $now = now();

        $products = DB::table('products')
            ->select('id','name','category_id','price','sale_price','slug')
            ->get();

        // Lấy map category id -> slug để heuristic
        $catMap = DB::table('categories')->pluck('slug','id');

        $rows = [];

        foreach ($products as $p) {
            $catSlug = $catMap[$p->category_id] ?? '';

            if ($catSlug === 'smartphones') {
                // Ví dụ 3 biến thể dung lượng + 2 màu => 6 biến thể (giá chênh nhẹ)
                $storages = ['128GB', '256GB', '512GB'];
                $colors   = ['Đen', 'Xanh'];

                foreach ($colors as $ci => $color) {
                    foreach ($storages as $si => $storage) {
                        $name = "{$color} / {$storage}";

                        // tăng giá tùy theo storage
                        $priceDelta = $si * 1000000; // +1tr / +2tr
                        $price = (int)$p->price + $priceDelta;
                        $salePrice = $p->sale_price ? (int)$p->sale_price + $priceDelta : null;

                        $rows[] = [
                            'product_id' => $p->id,
                            'sku'        => strtoupper(Str::slug($p->slug))."-".($ci+1).($si+1),
                            'name'       => $name,
                            'slug'       => Str::slug($name),
                            'attrs'      => json_encode(['color' => $color, 'storage' => $storage]),
                            'price_override'       => $price,
                            'sale_price_override'  => $salePrice,
                            'stock'      => 10,
                            'is_default' => ($ci === 0 && $si === 0), // cái đầu mặc định
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                }
            } elseif ($catSlug === 'laptops') {
                $rams  = ['16GB', '32GB'];
                $ssds  = ['512GB', '1TB'];

                foreach ($rams as $ri => $ram) {
                    foreach ($ssds as $si => $ssd) {
                        $name = "{$ram} / {$ssd}";
                        $priceDelta = ($ri * 1500000) + ($si * 1000000);
                        $price = (int)$p->price + $priceDelta;
                        $salePrice = $p->sale_price ? (int)$p->sale_price + $priceDelta : null;

                        $rows[] = [
                            'product_id' => $p->id,
                            'sku'        => strtoupper(Str::slug($p->slug))."-L".($ri+1).($si+1),
                            'name'       => $name,
                            'slug'       => Str::slug($name),
                            'attrs'      => json_encode(['ram' => $ram, 'ssd' => $ssd]),
                            'price_override'       => $price,
                            'sale_price_override'  => $salePrice,
                            'stock'      => 7,
                            'is_default' => ($ri === 0 && $si === 0),
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }
                }
            } else {
                // accessories: 2 biến thể màu
                $colors = ['Đen', 'Trắng'];
                foreach ($colors as $ci => $color) {
                    $name = $color;
                    $rows[] = [
                        'product_id' => $p->id,
                        'sku'        => strtoupper(Str::slug($p->slug))."-A".($ci+1),
                        'name'       => $name,
                        'slug'       => Str::slug($name),
                        'attrs'      => json_encode(['color' => $color]),
                        'price_override'       => null, // dùng giá gốc
                        'sale_price_override'  => null,
                        'stock'      => 20,
                        'is_default' => ($ci === 0),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
        }

        // Xóa cũ – seed lại (tùy môi trường)
        DB::table('product_variants')->truncate();

        if (!empty($rows)) {
            DB::table('product_variants')->insert($rows);
        }
    }
}
