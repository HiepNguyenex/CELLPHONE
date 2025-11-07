<?php
// database/migrations/2025_11_07_000001_create_chat_messages_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->uuid('chat_session_id');
            $table->enum('sender',['user','bot']);
            $table->text('message');
            $table->timestamps();

            $table->foreign('chat_session_id')
                  ->references('id')->on('chat_sessions')
                  ->onDelete('cascade');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
