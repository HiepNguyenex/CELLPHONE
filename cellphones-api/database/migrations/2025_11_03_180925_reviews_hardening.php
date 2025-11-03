<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1) Thêm cột verified_purchase nếu thiếu
        if (!Schema::hasColumn('reviews', 'verified_purchase')) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->boolean('verified_purchase')->default(false)->after('status');
                $table->index('verified_purchase');
            });
        }

        // 2) Đảm bảo unique (product_id, user_id) tồn tại (tránh tạo trùng)
        $driver = Schema::getConnection()->getDriverName();
        $hasUnique = false;

        if ($driver === 'mysql') {
            $rows = DB::select("
                SELECT INDEX_NAME,
                       GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS cols
                FROM INFORMATION_SCHEMA.STATISTICS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'reviews'
                  AND NON_UNIQUE = 0
                GROUP BY INDEX_NAME
            ");
            foreach ($rows as $r) {
                if (in_array($r->cols, ['product_id,user_id','user_id,product_id'], true)) {
                    $hasUnique = true; break;
                }
            }
        } elseif ($driver === 'sqlite') {
            $indexes = DB::select("PRAGMA index_list('reviews')");
            foreach ($indexes as $idx) {
                $info = DB::select("PRAGMA index_info('{$idx->name}')");
                $cols = implode(',', array_map(fn($i) => $i->name, $info));
                if (in_array($cols, ['product_id,user_id','user_id,product_id'], true)) {
                    $hasUnique = true; break;
                }
            }
        } else {
            // Fallback: sẽ thử tạo trực tiếp, nếu lỗi thì coi như đã tồn tại
        }

        if (!$hasUnique) {
            Schema::table('reviews', function (Blueprint $table) {
                $table->unique(['product_id','user_id'], 'reviews_user_product_unique');
            });
        }
    }

    public function down(): void
    {
        // Idempotent: chỉ drop unique nếu đúng tên
        try {
            Schema::table('reviews', function (Blueprint $table) {
                $table->dropUnique('reviews_user_product_unique');
            });
        } catch (\Throwable $e) {
            // bỏ qua nếu không tồn tại
        }
        // Không drop cột verified_purchase để tránh mất dữ liệu
    }
};
