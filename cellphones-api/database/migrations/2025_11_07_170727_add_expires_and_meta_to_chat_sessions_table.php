<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('chat_sessions', function (Blueprint $table) {
            // đã thêm ở bước trước: status, closed_at, last_activity_at

            if (!Schema::hasColumn('chat_sessions', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('last_activity_at');
            }
            if (!Schema::hasColumn('chat_sessions', 'meta')) {
                // JSON để lưu các flag nhẹ
                $table->json('meta')->nullable()->after('expires_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('chat_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('chat_sessions', 'meta'))       $table->dropColumn('meta');
            if (Schema::hasColumn('chat_sessions', 'expires_at'))  $table->dropColumn('expires_at');
        });
    }
};
