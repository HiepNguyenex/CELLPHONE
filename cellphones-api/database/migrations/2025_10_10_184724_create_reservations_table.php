<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('reservations')) {
            Schema::create('reservations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('store_id')->constrained()->cascadeOnDelete();
                $table->foreignId('product_id')->constrained()->cascadeOnDelete();
                $table->string('customer_name');
                $table->string('customer_phone');
                $table->unsignedInteger('qty')->default(1);
                $table->timestamp('expires_at')->nullable(); // ví dụ hold 2 giờ
                $table->string('status')->default('pending'); // pending, picked, canceled, expired
                $table->timestamps();
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('reservations');
    }
};
