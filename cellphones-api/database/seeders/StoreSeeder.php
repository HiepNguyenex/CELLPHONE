<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StoreSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $now = now();

            // ================= STORES =================
            if (!Schema::hasTable('stores')) {
                return;
            }

            $statusCol = Schema::hasColumn('stores', 'is_active')
                ? 'is_active'
                : (Schema::hasColumn('stores', 'active') ? 'active' : null);

            $baseStores = [
                ['name' => 'CPS Nguyễn Trãi, Q.1',    'city' => 'HCM'],
                ['name' => 'CPS Quang Trung, Gò Vấp', 'city' => 'HCM'],
                ['name' => 'CPS Cầu Giấy',            'city' => 'HN'],
                ['name' => 'CPS Đà Nẵng',             'city' => 'DN'],
                ['name' => 'CPS Nguyễn Huệ, Q.1',     'city' => 'HCM'],
            ];

            $stores = [];
            foreach ($baseStores as $s) {
                $row = [
                    'name'       => $s['name'],
                    'city'       => $s['city'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
                if ($statusCol) {
                    $row[$statusCol] = 1;
                }
                $stores[] = $row;
            }

            $updateCols = ['city', 'updated_at'];
            if ($statusCol) $updateCols[] = $statusCol;

            DB::table('stores')->upsert($stores, ['name'], $updateCols);

            $storeIdsByName = DB::table('stores')->pluck('id', 'name')->toArray();

            // =============== INVENTORIES ===============
            // Tự nhận diện bảng tồn kho: store_inventories (ưu tiên) hoặc inventories
            $invTable = Schema::hasTable('store_inventories')
                ? 'store_inventories'
                : (Schema::hasTable('inventories') ? 'inventories' : null);

            if (!$invTable) {
                return;
            }

            // Cột giao nhanh: fast_2h hoặc fast_delivery (nếu không có thì bỏ qua)
            $fastCol = Schema::hasColumn($invTable, 'fast_2h')
                ? 'fast_2h'
                : (Schema::hasColumn($invTable, 'fast_delivery') ? 'fast_delivery' : null);

            // Lấy danh sách sản phẩm để seed tồn kho (ví dụ 10–12 sản phẩm đầu)
            $productIds = DB::table('products')->orderBy('id')->limit(10)->pluck('id')->all();

            // Một số cửa hàng có khả năng giao nhanh 2h
            $fastStores = ['CPS Nguyễn Trãi, Q.1', 'CPS Quang Trung, Gò Vấp', 'CPS Đà Nẵng'];
            $fastStoreIds = collect($fastStores)
                ->map(fn ($name) => $storeIdsByName[$name] ?? null)
                ->filter()
                ->values()
                ->all();

            $rows = [];
            foreach ($storeIdsByName as $storeName => $storeId) {
                foreach ($productIds as $pid) {
                    $row = [
                        'store_id'   => (int) $storeId,
                        'product_id' => (int) $pid,
                        'stock'      => random_int(0, 8),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                    if ($fastCol) {
                        $row[$fastCol] = in_array($storeId, $fastStoreIds, true)
                            ? (random_int(0, 1) ? 1 : 0)
                            : 0;
                    }
                    $rows[] = $row;
                }
            }

            // Dùng UPSERT để không bao giờ trùng unique (store_id, product_id)
            $invUpdateCols = ['stock', 'updated_at'];
            if ($fastCol) $invUpdateCols[] = $fastCol;

            // Upsert theo lô để an toàn với DB có giới hạn placeholder
            foreach (array_chunk($rows, 500) as $chunk) {
                DB::table($invTable)->upsert(
                    $chunk,
                    ['store_id', 'product_id'],   // unique constraint
                    $invUpdateCols                // columns sẽ update khi trùng
                );
            }
        });
    }
}
