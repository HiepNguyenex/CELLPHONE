<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('flash_sales', function (Blueprint $table) {
            if (!Schema::hasColumn('flash_sales', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('end_time');
                $table->index(['is_active', 'start_time', 'end_time'], 'flash_active_time_idx');
            }
        });
    }

    public function down(): void
    {
        Schema::table('flash_sales', function (Blueprint $table) {
            if (Schema::hasColumn('flash_sales', 'is_active')) {
                $table->dropIndex('flash_active_time_idx');
                $table->dropColumn('is_active');
            }
        });
    }
};
