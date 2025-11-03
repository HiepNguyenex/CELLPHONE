<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // ❌ Không thêm cột vì đã có
            // $table->boolean('verified_purchase')->default(false)->after('rating');

            // ✅ Thêm ràng buộc unique cho (user_id, product_id)
            $table->unique(['user_id', 'product_id'], 'unique_user_product_review');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropUnique('unique_user_product_review');
            // ❌ Không cần drop cột verified_purchase
        });
    }
};
