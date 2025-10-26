<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('warranty_plans')) {
            Schema::create('warranty_plans', function (Blueprint $table) {
                $table->id();

                // Áp dụng theo đối tượng nào (nullable để dùng chung)
                $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
                $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
                $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();

                $table->string('name');                 // ví dụ: "Bảo hành mở rộng 12 tháng"
                $table->string('slug')->unique();       // ví dụ: "ex12", "ex24", "break"
                $table->string('type')->default('extended'); // extended | accident | combo
                $table->unsignedSmallInteger('months')->default(12);

                // ✅ Dùng float để tương thích SQLite (decimal sẽ lỗi)
                $table->float('price', 12, 2)->default(0);

                $table->boolean('active')->default(true);
                $table->timestamps();

                $table->index(['product_id', 'category_id', 'brand_id'], 'warranty_targets_idx');
                $table->index(['type', 'active'], 'warranty_type_active_idx');
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('warranty_plans');
    }
};
