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
                $table->string('name')->unique(); // ✅ thêm unique để SQLite hỗ trợ upsert()
                $table->string('city')->index();  // HCM, HN, DN...
                $table->string('address')->nullable();
                $table->decimal('lat', 10, 6)->nullable();
                $table->decimal('lng', 10, 6)->nullable();
                $table->timestamps();
            });
        }

        // ===== Bảng store_inventories =====
        if (!Schema::hasTable('store_inventories')) {
            Schema::create('store_inventories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('store_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
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
