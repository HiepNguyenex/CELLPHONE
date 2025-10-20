<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // ✅ THÊM: specs JSON, để sau description là hợp lý
            if (!Schema::hasColumn('products', 'specs')) {
                $table->json('specs')->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'specs')) {
                $table->dropColumn('specs');
            }
        });
    }
};
