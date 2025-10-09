<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            // Thêm is_active nếu chưa có
            if (!Schema::hasColumn('brands', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
            // Thêm sort_order nếu chưa có (vì code có orderBy sort_order)
            if (!Schema::hasColumn('brands', 'sort_order')) {
                $table->unsignedInteger('sort_order')->default(0);
            }
        });
    }

    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            // Xoá có điều kiện để tránh lỗi rollback
            if (Schema::hasColumn('brands', 'is_active')) {
                $table->dropColumn('is_active');
            }
            if (Schema::hasColumn('brands', 'sort_order')) {
                $table->dropColumn('sort_order');
            }
        });
    }
};
