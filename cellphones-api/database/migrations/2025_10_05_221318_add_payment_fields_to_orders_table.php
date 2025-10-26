<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            // ✅ Thêm từng cột có điều kiện (tránh lỗi duplicate)
            if (!Schema::hasColumn('orders', 'payment_method')) {
                $t->string('payment_method', 20)->nullable()->after('status'); // cod|vnpay|momo|stripe ...
            }
            if (!Schema::hasColumn('orders', 'payment_status')) {
                $t->string('payment_status', 20)->default('unpaid')->after('payment_method'); // unpaid|paid|failed|refunded
            }
            if (!Schema::hasColumn('orders', 'payment_code')) {
                $t->string('payment_code', 100)->nullable()->after('payment_status'); // mã giao dịch từ cổng
            }
            if (!Schema::hasColumn('orders', 'payment_paid_at')) {
                $t->timestamp('payment_paid_at')->nullable()->after('payment_code');
            }
            if (!Schema::hasColumn('orders', 'payment_note')) {
                $t->text('payment_note')->nullable()->after('payment_paid_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $t) {
            // ✅ Xóa cột có điều kiện (nếu tồn tại)
            $cols = ['payment_method', 'payment_status', 'payment_code', 'payment_paid_at', 'payment_note'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('orders', $col)) {
                    $t->dropColumn($col);
                }
            }
        });
    }
};
