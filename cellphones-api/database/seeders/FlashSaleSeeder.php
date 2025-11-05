<?php

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
                'start_time' => now()->subDay(), // bắt đầu hôm qua
                'end_time'   => now()->addDays(3), // kết thúc sau 3 ngày
                'is_active'  => true,
            ]
        );
    }
}
