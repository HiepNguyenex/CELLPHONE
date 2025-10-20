<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('product_id')->index();
            $table->string('sku')->nullable()->index();
            $table->string('name')->nullable(); // ví dụ: "Xanh / 12GB / 256GB"
            $table->string('slug')->index();    // dùng chọn qua URL/slug
            $table->json('attrs')->nullable();  // { "color": "Xanh", "ram": "12GB", "storage": "256GB" }

            // Giá có thể override theo biến thể (nếu null => dùng giá của product)
            $table->unsignedBigInteger('price_override')->nullable();
            $table->unsignedBigInteger('sale_price_override')->nullable();

            $table->integer('stock')->default(0);
            $table->boolean('is_default')->default(false);

            $table->timestamps();

            // Ràng buộc
            $table->unique(['product_id', 'slug']);
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
