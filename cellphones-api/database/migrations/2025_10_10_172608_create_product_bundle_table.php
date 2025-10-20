<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_bundle', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('bundle_product_id')->constrained('products')->cascadeOnDelete();

            $table->boolean('is_active')->default(true); // ✅ Bổ sung cột này
            $table->timestamps();

            $table->unique(['product_id', 'bundle_product_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('product_bundle');
    }
};
