<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // phương thức vận chuyển: standard | express (mặc định standard)
            $table->string('shipping_method', 20)->default('standard')->after('status');

            // phương thức thanh toán: cod (sau này có thể thêm vnpay/momo/stripe)
            $table->string('payment_method', 20)->default('cod')->after('shipping_method');

            // ghi chú của khách
            $table->string('note', 500)->nullable()->after('payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['shipping_method', 'payment_method', 'note']);
        });
    }
};
