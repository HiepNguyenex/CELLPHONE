<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('product_bundle', function (Blueprint $table) {
            if (!Schema::hasColumn('product_bundle', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('bundle_product_id');
            }
            if (!Schema::hasColumn('product_bundle', 'discount_percent')) {
                $table->unsignedSmallInteger('discount_percent')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('product_bundle', 'discount_amount')) {
                $table->unsignedInteger('discount_amount')->nullable()->after('discount_percent');
            }
        });
    }

    public function down(): void {
        Schema::table('product_bundle', function (Blueprint $table) {
            if (Schema::hasColumn('product_bundle', 'discount_amount'))   $table->dropColumn('discount_amount');
            if (Schema::hasColumn('product_bundle', 'discount_percent'))  $table->dropColumn('discount_percent');
            if (Schema::hasColumn('product_bundle', 'is_active'))         $table->dropColumn('is_active');
        });
    }
};
