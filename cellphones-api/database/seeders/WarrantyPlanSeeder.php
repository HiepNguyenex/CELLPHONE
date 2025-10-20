<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class WarrantyPlanSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            if (! Schema::hasTable('warranty_plans')) {
                return;
            }

            $now = now();

            // Tự dò cột cho tương thích nhiều schema
            $hasSlug         = Schema::hasColumn('warranty_plans', 'slug');
            $hasDesc         = Schema::hasColumn('warranty_plans', 'description');
            $hasPrice        = Schema::hasColumn('warranty_plans', 'price');           // migration hiện tại
            $hasPriceFixed   = Schema::hasColumn('warranty_plans', 'price_fixed');    // nếu project khác dùng
            $hasPricePercent = Schema::hasColumn('warranty_plans', 'price_percent');  // nếu project khác dùng

            $activeCol = Schema::hasColumn('warranty_plans', 'active')
                ? 'active'
                : (Schema::hasColumn('warranty_plans', 'is_active') ? 'is_active' : null);

            // Định nghĩa các gói (giá dùng số thực, KHÔNG dùng ký tự '?')
            $defs = [
                [
                    'slug'        => 'ex12',
                    'name'        => 'Bảo hành mở rộng 12 tháng',
                    'type'        => 'extended',
                    'months'      => 12,
                    'price_value' => 399000,
                    'desc'        => 'Kéo dài thời gian bảo hành tiêu chuẩn thêm 12 tháng.',
                    'active'      => 1,
                ],
                [
                    'slug'        => 'break12',
                    'name'        => 'Bảo hiểm rơi vỡ / vào nước 12 tháng',
                    'type'        => 'accident',
                    'months'      => 12,
                    'price_value' => 499000,
                    'desc'        => 'Bảo vệ sự cố do rơi vỡ, vào nước một lần trong thời hạn.',
                    'active'      => 1,
                ],
                [
                    'slug'        => 'ex24',
                    'name'        => 'Bảo hành mở rộng 24 tháng',
                    'type'        => 'extended',
                    'months'      => 24,
                    'price_value' => 699000,
                    'desc'        => 'Gia hạn 24 tháng cho máy, không kèm phụ kiện.',
                    'active'      => 1,
                ],
            ];

            $rows = [];
            foreach ($defs as $d) {
                $row = [
                    'name'       => $d['name'],
                    'type'       => $d['type'],
                    'months'     => $d['months'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
                if ($hasSlug)      $row['slug'] = $d['slug'];
                if ($hasDesc)      $row['description'] = $d['desc'];
                if ($activeCol)    $row[$activeCol] = (int) $d['active'];

                // Map giá theo schema hiện có
                if ($hasPrice) {
                    $row['price'] = $d['price_value'];
                } else {
                    // Fallback cho schema khác (nếu có)
                    if ($hasPriceFixed)   $row['price_fixed']   = $d['price_value'];
                    if ($hasPricePercent) $row['price_percent'] = 0;
                }

                // Nếu bảng có target theo product/category/brand thì để null
                foreach (['product_id','category_id','brand_id'] as $targetCol) {
                    if (Schema::hasColumn('warranty_plans', $targetCol)) {
                        $row[$targetCol] = null;
                    }
                }

                $rows[] = $row;
            }

            // Unique key: ưu tiên slug, nếu không có thì (name, months, type)
            $uniqueBy = $hasSlug ? ['slug'] : ['name','months','type'];

            $updateCols = ['name','type','months','updated_at'];
            if ($hasDesc)      $updateCols[] = 'description';
            if ($activeCol)    $updateCols[] = $activeCol;
            if ($hasPrice)     $updateCols[] = 'price';
            if ($hasPriceFixed)   $updateCols[] = 'price_fixed';
            if ($hasPricePercent) $updateCols[] = 'price_percent';

            DB::table('warranty_plans')->upsert($rows, $uniqueBy, $updateCols);
        });
    }
}
