<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            $t->string('payment_method', 20)->nullable()->after('status');      // cod|vnpay|momo|stripe ...
            $t->string('payment_status', 20)->default('unpaid')->after('payment_method'); // unpaid|paid|failed|refunded
            $t->string('payment_code', 100)->nullable()->after('payment_status'); // mã giao dịch từ cổng
            $t->timestamp('payment_paid_at')->nullable()->after('payment_code');
            $t->text('payment_note')->nullable()->after('payment_paid_at');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            $t->dropColumn(['payment_method','payment_status','payment_code','payment_paid_at','payment_note']);
        });
    }
};
