<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('chat_sessions')) {
            // Nếu ai đó chưa tạo bảng -> tạo nhanh bảng chuẩn
            Schema::create('chat_sessions', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->enum('status', ['open','closed'])->default('open');
                $table->timestamp('last_activity_at')->nullable();
                $table->timestamp('expires_at')->nullable();
                $table->json('meta')->nullable();
                $table->timestamps();
                $table->index(['user_id','status'], 'chat_sessions_user_status_idx');
            });
            return;
        }

        Schema::table('chat_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('chat_sessions', 'status')) {
                $table->enum('status', ['open','closed'])->default('open')->after('user_id');
            }
            if (!Schema::hasColumn('chat_sessions', 'last_activity_at')) {
                $table->timestamp('last_activity_at')->nullable()->after('status');
            }
            if (!Schema::hasColumn('chat_sessions', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('last_activity_at');
            }
            if (!Schema::hasColumn('chat_sessions', 'meta')) {
                $table->json('meta')->nullable()->after('expires_at');
            }

            // Bổ sung index nếu thiếu
            try {
                DB::statement('CREATE INDEX chat_sessions_user_status_idx ON chat_sessions (user_id, status)');
            } catch (\Throwable $e) {
                // đã có thì bỏ qua
            }
        });
    }

    public function down(): void
    {
        // KHÔNG drop cột để an toàn rollback (no-op)
    }
};
