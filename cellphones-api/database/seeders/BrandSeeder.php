<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ✅ NÂNG CẤP: Kết hợp các nguồn CDN ổn định nhất
        $brands = [
            // === 8 LOGO ĐÃ HOẠT ĐỘNG (GIỮ NGUYÊN) ===
            'Apple'    => 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
            'Dell'     => 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg',
            'HP'       => 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg',
            'Xiaomi'   => 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg',
            'OPPO'     => 'https://upload.wikimedia.org/wikipedia/commons/b/b8/OPPO_Logo.svg',
            'Sony'     => 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
            'vivo'     => 'https://cdn.worldvectorlogo.com/logos/vivo-1.svg',
            'realme'   => 'https://cdn.worldvectorlogo.com/logos/realme-1.svg',

            // === 5 LOGO BỊ LỖI (SỬA LẠI NGUỒN TỪ logo.wine) ===
            'Samsung'  => 'https://www.logo.wine/a/logo/Samsung/Samsung-Logo.wine.svg',
            'Asus'     => 'https://www.logo.wine/a/logo/Asus/Asus-Logo.wine.svg',
            'Lenovo'   => 'https://cdn.freebiesupply.com/images/thumbs/2x/lenovo-logo.png',
            'Logitech' => 'https://www.logo.wine/a/logo/Logitech/Logitech-Logo.wine.svg',
            'Anker'    => 'https://cdn.freelogovectors.net/wp-content/uploads/2018/06/anker-logo.png',
        ];

        $i = 0;
        foreach ($brands as $name => $logoUrl) {
            $slug = Str::slug($name);
            
            // Dùng updateOrCreate để cập nhật logo cho các hãng đã có
            Brand::updateOrCreate(
                ['slug' => $slug], // 👈 Điều kiện để TÌM
                [
                    // 👇 Dữ liệu để CẬP NHẬT hoặc TẠO MỚI
                    'name'       => $name,
                    'is_active'  => true,
                    'sort_order' => $i++,
                    'logo'       => $logoUrl // ✅ Cột logo dùng link chuẩn
                ]
            );
        }
    }
}