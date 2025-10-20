<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating'); // 1..5
            $table->text('content')->nullable();

            // Moderation
            $table->string('status')->default('pending')->index(); // pending|approved|rejected
            $table->boolean('is_flagged')->default(false)->index();
            $table->text('moderation_note')->nullable();

            $table->timestamps();

            $table->unique(['product_id','user_id']); // 1 user / 1 product (nếu muốn cho nhiều thì bỏ)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
