<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('chat_sessions', function (Blueprint $table) {
            if (!Schema::hasColumn('chat_sessions', 'status')) {
                $table->enum('status', ['open', 'closed'])
                    ->default('open')
                    ->index()
                    ->after('session_uuid');
            }
            if (!Schema::hasColumn('chat_sessions', 'closed_at')) {
                $table->timestamp('closed_at')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('chat_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('chat_sessions', 'closed_at')) {
                $table->dropColumn('closed_at');
            }
            if (Schema::hasColumn('chat_sessions', 'status')) {
                $table->dropColumn('status');
            }
        });
    }
};
