<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Chỉ thêm nếu CHƯA có cột brand_id
        if (!Schema::hasColumn('products', 'brand_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->foreignId('brand_id')
                      ->nullable()
                      ->after('category_id')
                      ->constrained('brands')
                      ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        // Chỉ drop nếu ĐANG có cột brand_id
        if (Schema::hasColumn('products', 'brand_id')) {
            Schema::table('products', function (Blueprint $table) {
                // Tương thích cả bản MySQL cũ
                try {
                    $table->dropConstrainedForeignId('brand_id');
                } catch (\Throwable $e) {
                    $table->dropForeign(['brand_id']);
                    $table->dropColumn('brand_id');
                }
            });
        }
    }
};
