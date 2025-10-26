<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        // ===== Bảng stores =====
        if (!Schema::hasTable('stores')) {
            Schema::create('stores', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique(); // ✅ unique để upsert()
                $table->string('city')->index();  // HCM, HN, DN...
                $table->string('address')->nullable();
                $table->float('lat', 10, 6)->nullable(); // ✅ float thay decimal
                $table->float('lng', 10, 6)->nullable(); // ✅ float thay decimal
                $table->timestamps();
            });
        }

        // ===== Bảng store_inventories =====
        if (!Schema::hasTable('store_inventories')) {
            Schema::create('store_inventories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('store_id')->nullable()->constrained('stores')->nullOnDelete();
                $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
                $table->unsignedInteger('stock')->default(0);
                $table->timestamps();

                $table->unique(['store_id', 'product_id']);
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('store_inventories');
        Schema::dropIfExists('stores');
    }
};
