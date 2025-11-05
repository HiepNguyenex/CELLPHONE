<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('flash_sale_items', function (Blueprint $table) {
            $table->id();

            // 🔗 Liên kết đến flash_sales và products
            $table->foreignId('flash_sale_id')
                ->constrained('flash_sales')
                ->cascadeOnDelete();

            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();

            // 💰 Thêm 2 cột chi tiết giảm giá
            $table->decimal('sale_price', 12, 2)->nullable()->comment('Giá sale cụ thể');
            $table->unsignedTinyInteger('discount_percent')->default(0)->comment('Phần trăm giảm giá');

            // ⚙️ Cờ bật/tắt sản phẩm trong đợt sale
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // 🔒 Mỗi sản phẩm chỉ xuất hiện 1 lần trong 1 Flash Sale
            $table->unique(['flash_sale_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flash_sale_items');
    }
};
