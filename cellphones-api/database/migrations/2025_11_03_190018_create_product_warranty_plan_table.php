<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('warranty_plans')) {
            Schema::create('warranty_plans', function (Blueprint $table) {
                $table->id();

                // áp dụng cho sản phẩm/cate/brand cụ thể hoặc toàn cục (null)
                $table->unsignedBigInteger('product_id')->nullable()->index();
                $table->unsignedBigInteger('category_id')->nullable()->index();
                $table->unsignedBigInteger('brand_id')->nullable()->index();

                $table->string('name');                  // tên gói (ví dụ: "BH mở rộng 12 tháng")
                $table->string('type')->nullable();      // extended / accident / combo...
                $table->unsignedInteger('months')->nullable(); // thời hạn
                $table->unsignedInteger('price')->default(0);  // đơn giá (VND)
                $table->boolean('is_active')->default(true);   // còn bán?

                $table->timestamps();

                // nếu muốn ràng buộc FK thì thêm sau khi dữ liệu ổn định
                // $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('warranty_plans');
    }
};
