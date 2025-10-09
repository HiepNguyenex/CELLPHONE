<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $names = [
            'Apple','Samsung','Asus','Dell','HP','Lenovo',
            'Xiaomi','OPPO','vivo','realme','Sony','Logitech','Anker',
        ];

        foreach ($names as $i => $name) {
            $slug = Str::slug($name);
            Brand::firstOrCreate(
                ['slug' => $slug], // 👈 dùng slug làm khóa để tránh lỗi unique
                [
                    'name'       => $name,
                    'is_active'  => true,
                    'sort_order' => $i,
                ]
            );
        }
    }
}
