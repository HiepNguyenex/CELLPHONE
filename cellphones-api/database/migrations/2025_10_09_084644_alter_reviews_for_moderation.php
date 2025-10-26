<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (!Schema::hasColumn('reviews', 'status')) {
                    $table->string('status')->default('pending')->index();
                }
                if (!Schema::hasColumn('reviews', 'is_flagged')) {
                    $table->boolean('is_flagged')->default(false)->index();
                }
                if (!Schema::hasColumn('reviews', 'moderation_note')) {
                    $table->text('moderation_note')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('reviews')) {
            Schema::table('reviews', function (Blueprint $table) {
                if (Schema::hasColumn('reviews', 'status')) $table->dropColumn('status');
                if (Schema::hasColumn('reviews', 'is_flagged')) $table->dropColumn('is_flagged');
                if (Schema::hasColumn('reviews', 'moderation_note')) $table->dropColumn('moderation_note');
            });
        }
    }
};
