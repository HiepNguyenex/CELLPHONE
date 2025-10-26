<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['name' => 'Smartphones', 'slug' => 'smartphones'],
            ['name' => 'Laptops',     'slug' => 'laptops'],
            ['name' => 'Accessories', 'slug' => 'accessories'],
        ];
        foreach ($rows as $r) {
            Category::updateOrCreate(['slug' => $r['slug']], $r);
        }
    }
}
