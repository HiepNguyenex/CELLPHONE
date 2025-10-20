<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        $products = DB::table('products')
            ->select('id', 'image_url')
            ->whereNotNull('image_url')
            ->where('image_url', '!=', '')
            ->get();

        $rows = [];

        foreach ($products as $p) {
            $base = $p->image_url;
            if (!$base) continue;

            // Lấy đuôi ảnh
            $ext = pathinfo($base, PATHINFO_EXTENSION);
            $name = pathinfo($base, PATHINFO_FILENAME);

            // Tạo các link phụ giả định (nếu thực tế có)
            $vars = [
                $base,
                $name . "_1." . $ext,
                $name . "_2." . $ext,
            ];

            $pos = 0;
            foreach ($vars as $v) {
                $url = $v;
                // Nếu $v không là đường dẫn đầy đủ, ghép base domain
                if (!preg_match("#^https?://#", $v)) {
                    // ex: nếu base là https://cdn2.cellphones..., lấy domain + phần path
                    $parsed = parse_url($base);
                    $domain = $parsed['scheme'] . "://" . $parsed['host'];
                    $path = $parsed['path']; // /.../filename.ext
                    $dir = substr($path, 0, strrpos($path, '/'));
                    $url = $domain . $dir . "/" . $v;
                }

                // Kiểm tra không trùng trong rows đã tạo
                $duplicate = collect($rows)
                    ->first(fn($r) => $r['product_id'] == $p->id && $r['url'] === $url);
                if ($duplicate) {
                    continue;
                }

                $rows[] = [
                    'product_id' => $p->id,
                    'url' => $url,
                    'position' => $pos++,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if (!empty($rows)) {
            DB::table('product_images')->insert($rows);
        }
    }
}
