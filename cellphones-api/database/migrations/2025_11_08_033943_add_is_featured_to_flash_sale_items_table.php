<?php

// File: database/migrations/..._add_is_featured_to_flash_sale_items_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('flash_sale_items', function (Blueprint $table) {
            $table->boolean('is_featured')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('flash_sale_items', function (Blueprint $table) {
            $table->dropColumn('is_featured');
        });
    }
};