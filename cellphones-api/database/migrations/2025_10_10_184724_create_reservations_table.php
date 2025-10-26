<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('reservations')) {
            Schema::create('reservations', function (Blueprint $table) {
                $table->id();

                // Cho phép null để tránh lỗi SQLite nếu bảng store/product chưa sẵn
                $table->foreignId('store_id')->nullable()->constrained('stores')->nullOnDelete();
                $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();

                $table->string('customer_name');
                $table->string('customer_phone');
                $table->unsignedInteger('qty')->default(1);
                $table->timestamp('expires_at')->nullable(); // ví dụ hold 2 giờ
                $table->string('status')->default('pending'); // pending, picked, canceled, expired
                $table->timestamps();

                // ✅ UNIQUE để tránh trùng đơn hàng dự phòng
                $table->unique(['store_id', 'product_id', 'customer_phone']);
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('reservations');
    }
};
