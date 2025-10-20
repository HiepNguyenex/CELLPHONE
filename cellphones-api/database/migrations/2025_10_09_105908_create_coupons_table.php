<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $t) {
            $t->id();
            $t->string('code', 50)->unique();     // ví dụ: WELCOME10
            $t->unsignedTinyInteger('discount');  // phần trăm 1..100
            $t->unsignedInteger('used')->default(0);
            $t->unsignedInteger('max_uses')->nullable(); // null = không giới hạn
            $t->timestamp('starts_at')->nullable();
            $t->timestamp('expires_at')->nullable();
            $t->enum('status', ['active','inactive'])->default('active');
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
