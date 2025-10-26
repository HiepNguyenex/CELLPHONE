<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
public function up(): void
{
    Schema::create('products', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('slug')->unique();
        $table->decimal('price', 15, 2);
        $table->decimal('sale_price', 15, 2)->nullable();
        $table->text('description')->nullable();   // ✅ thêm mô tả
        $table->string('image_url')->nullable();   // ✅ thêm ảnh nếu cần
        $table->foreignId('brand_id')->constrained('brands')->onDelete('cascade');
        $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
