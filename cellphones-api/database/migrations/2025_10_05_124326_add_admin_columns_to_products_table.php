<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'slug')) {
                $table->string('slug')->unique()->nullable()->after('name');
            }
            if (!Schema::hasColumn('products', 'sale_price')) {
                $table->unsignedBigInteger('sale_price')->nullable()->after('price');
            }
            if (!Schema::hasColumn('products', 'image_url')) {
                $table->string('image_url')->nullable()->after('sale_price');
            }
            if (!Schema::hasColumn('products', 'stock')) {
                $table->unsignedInteger('stock')->default(0)->after('image_url');
            }
            if (!Schema::hasColumn('products', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('stock');
            }
            if (!Schema::hasColumn('products', 'short_description')) {
                $table->text('short_description')->nullable()->after('is_featured');
            }
            if (!Schema::hasColumn('products', 'description')) {
                $table->longText('description')->nullable()->after('short_description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Cẩn thận khi rollback nếu dữ liệu đã dùng
            if (Schema::hasColumn('products', 'description')) $table->dropColumn('description');
            if (Schema::hasColumn('products', 'short_description')) $table->dropColumn('short_description');
            if (Schema::hasColumn('products', 'is_featured')) $table->dropColumn('is_featured');
            if (Schema::hasColumn('products', 'stock')) $table->dropColumn('stock');
            if (Schema::hasColumn('products', 'image_url')) $table->dropColumn('image_url');
            if (Schema::hasColumn('products', 'sale_price')) $table->dropColumn('sale_price');
            if (Schema::hasColumn('products', 'slug')) $table->dropColumn('slug');
        });
    }
};
