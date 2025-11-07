<?php
// File: database/seeders/FlashSaleSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FlashSale;

class FlashSaleSeeder extends Seeder
{
    public function run(): void
    {
        // ✅ Tạo 1 Flash Sale mẫu
        FlashSale::updateOrCreate(
            ['name' => 'Black Friday 2025'],
            [
                'description' => 'Siêu khuyến mãi Black Friday - giảm giá sốc toàn bộ sản phẩm HOT!',
                'banner_image_url' => 'images/banners/black_friday_2025_banner.jpg', 
                'start_time' => now()->subDay(), 
                'end_time'   => now()->addDays(3), 
                // 🚀 ĐÃ SỬA: Thay 'status' bằng 'is_active' (boolean)
                'is_active' => true, 
            ]
        );
    }
}