<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 🧩 Gọi toàn bộ seeders con theo đúng thứ tự logic
        $this->call([
            DemoSeeder::class,
            AdminUserSeeder::class,
            UserSeeder::class,
            FaqSeeder::class,
            CategorySeeder::class,
            BrandSeeder::class,
            ProductImageSeeder::class,
            ProductVariantSeeder::class,
            ProductBundleSeeder::class,
            StoreSeeder::class,
            WarrantyPlanSeeder::class,
            CouponSeeder::class,
            NewsSeeder::class,
        ]);

        // 🟢 Thông báo log ra terminal (dễ debug nếu có shell)
        echo "✅ All seeders executed successfully.\n";
    }
}
