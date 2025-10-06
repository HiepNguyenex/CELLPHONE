<?php

// database/migrations/xxxx_xx_xx_xxxxxx_create_order_status_histories_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('order_status_histories', function (Blueprint $t) {
      $t->id();
      $t->unsignedBigInteger('order_id')->index();
      $t->unsignedBigInteger('admin_id')->nullable()->index(); // ai đổi
      $t->string('from_status', 30)->nullable();
      $t->string('to_status', 30);
      $t->text('note')->nullable();
      $t->timestamps();

      $t->foreign('order_id')->references('id')->on('orders')->onDelete('cascade');
    });
  }
  public function down(): void {
    Schema::dropIfExists('order_status_histories');
  }
};
