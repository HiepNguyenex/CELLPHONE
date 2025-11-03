<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('order_item_addons')) {
            Schema::create('order_item_addons', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('order_item_id')->index();
                $table->unsignedBigInteger('warranty_plan_id')->nullable()->index();
                $table->string('name');
                $table->string('type')->nullable();   // extended/accident/combo...
                $table->unsignedInteger('months')->nullable();
                $table->unsignedInteger('price')->default(0); // snapshot per-unit
                $table->timestamps();

                $table->foreign('order_item_id')->references('id')->on('order_items')->onDelete('cascade');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_item_addons');
    }
};
