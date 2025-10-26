<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders','note'))             $table->text('note')->nullable();
            if (!Schema::hasColumn('orders','payment_method'))   $table->string('payment_method',50)->nullable();
            if (!Schema::hasColumn('orders','shipping_method'))  $table->string('shipping_method',50)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders','note'))            $table->dropColumn('note');
            if (Schema::hasColumn('orders','payment_method'))  $table->dropColumn('payment_method');
            if (Schema::hasColumn('orders','shipping_method')) $table->dropColumn('shipping_method');
        });
    }
};
