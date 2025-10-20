<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductBundleSeeder extends Seeder
{
    public function run(): void
    {
        // ✅ Xóa dữ liệu cũ
        DB::table('product_bundle')->truncate();

        // Helper: Lấy nhanh product_id theo tên
        $getId = fn($name) => Product::where('name', 'like', "%$name%")->value('id');

        // =============================
        // 🎁 1. iPhone 17 Pro → combo
        // =============================
        $iphone17 = $getId('iPhone 17 Pro');
        if ($iphone17) {
            $bundles = [
                $getId('AirPods Pro 2'),
                $getId('Anker 735 Charger'),
                $getId('Pin sạc dự phòng Anker 737'),
            ];
            $bundles = array_filter($bundles);
            if ($bundles) {
                foreach ($bundles as $b) {
                    DB::table('product_bundle')->insert([
                        'product_id' => $iphone17,
                        'bundle_product_id' => $b,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // =============================
        // 🎁 2. iPhone 15 Pro Max → combo
        // =============================
        $iphone15 = $getId('iPhone 15 Pro Max');
        if ($iphone15) {
            $bundles = [
                $getId('AirPods Pro 2'),
                $getId('Anker 735 Charger'),
                $getId('Ốp lưng'), // nếu có sản phẩm phụ kiện ốp lưng
            ];
            $bundles = array_filter($bundles);
            foreach ($bundles as $b) {
                DB::table('product_bundle')->insert([
                    'product_id' => $iphone15,
                    'bundle_product_id' => $b,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // =============================
        // 🎁 3. MacBook Pro 16” M3 Max → combo
        // =============================
        $macbook = $getId('MacBook Pro 16');
        if ($macbook) {
            $bundles = [
                $getId('Anker 735 Charger'),
                $getId('Pin sạc dự phòng Anker 737'),
                $getId('Sony WH-1000XM5'),
                $getId('Logitech MX Master 3S'),
            ];
            $bundles = array_filter($bundles);
            foreach ($bundles as $b) {
                DB::table('product_bundle')->insert([
                    'product_id' => $macbook,
                    'bundle_product_id' => $b,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // =============================
        // 🎁 4. Asus ROG Zephyrus G14 → combo
        // =============================
        $rog = $getId('Asus ROG Zephyrus G14');
        if ($rog) {
            $bundles = [
                $getId('Sony WH-1000XM5'),
                $getId('Logitech MX Master 3S'),
                $getId('Anker 735 Charger'),
            ];
            $bundles = array_filter($bundles);
            foreach ($bundles as $b) {
                DB::table('product_bundle')->insert([
                    'product_id' => $rog,
                    'bundle_product_id' => $b,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // =============================
        // 🎁 5. Galaxy S24 Ultra → combo
        // =============================
        $s24u = $getId('Galaxy S24 Ultra');
        if ($s24u) {
            $bundles = [
                $getId('Sony WF-1000XM5'),
                $getId('Anker 735 Charger'),
                $getId('Pin sạc dự phòng Anker 737'),
            ];
            $bundles = array_filter($bundles);
            foreach ($bundles as $b) {
                DB::table('product_bundle')->insert([
                    'product_id' => $s24u,
                    'bundle_product_id' => $b,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // =============================
        // 🎁 6. Xiaomi 14 Ultra → combo
        // =============================
        $xiaomi = $getId('Xiaomi 14 Ultra');
        if ($xiaomi) {
            $bundles = [
                $getId('Sony WF-1000XM5'),
                $getId('Anker 735 Charger'),
            ];
            $bundles = array_filter($bundles);
            foreach ($bundles as $b) {
                DB::table('product_bundle')->insert([
                    'product_id' => $xiaomi,
                    'bundle_product_id' => $b,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // =============================
        // 🎁 7. MacBook Air M3 → combo
        // =============================
        $mba = $getId('MacBook Air 13');
        if ($mba) {
            $bundles = [
                $getId('Logitech MX Master 3S'),
                $getId('Sony WH-1000XM5'),
            ];
            $bundles = array_filter($bundles);
            foreach ($bundles as $b) {
                DB::table('product_bundle')->insert([
                    'product_id' => $mba,
                    'bundle_product_id' => $b,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        echo "✅ Seeded product bundles successfully.\n";
    }
}
