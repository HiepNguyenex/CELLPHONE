<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Cho phép null các khóa ngoại (nếu đang NOT NULL)
            $table->unsignedBigInteger('brand_id')->nullable()->change();
            $table->unsignedBigInteger('category_id')->nullable()->change();

            // Đảm bảo các cột dưới có default/nullable hợp lý
            $table->integer('stock')->default(0)->change();
            $table->unsignedBigInteger('price')->default(0)->change();
            $table->unsignedBigInteger('sale_price')->nullable()->change();
            $table->string('image_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('brand_id')->nullable(false)->change();
            $table->unsignedBigInteger('category_id')->nullable(false)->change();
            // tùy bạn có muốn rollback các cột khác không
        });
    }
};
