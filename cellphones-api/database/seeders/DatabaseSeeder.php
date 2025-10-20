<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DemoSeeder::class,
            UserSeeder::class,
            FaqSeeder::class,
            CategorySeeder::class,
            AdminUserSeeder::class,
            BrandSeeder::class,
            CouponSeeder::class,
            ProductImageSeeder::class,
             ProductVariantSeeder::class,
             ProductBundleSeeder::class,
             StoreSeeder::class,
             WarrantyPlanSeeder::class,
        ]);
    }
}
