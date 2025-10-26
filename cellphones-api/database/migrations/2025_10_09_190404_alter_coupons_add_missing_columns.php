<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $t) {
            // Các cột cơ bản để hệ thống đang dùng
            if (!Schema::hasColumn('coupons', 'used')) {
                $t->unsignedInteger('used')->default(0);
            }
            if (!Schema::hasColumn('coupons', 'max_uses')) {
                $t->unsignedInteger('max_uses')->nullable();
            }
            if (!Schema::hasColumn('coupons', 'starts_at')) {
                $t->timestamp('starts_at')->nullable();
            }
            if (!Schema::hasColumn('coupons', 'expires_at')) {
                $t->timestamp('expires_at')->nullable();
            }
            if (!Schema::hasColumn('coupons', 'status')) {
                $t->enum('status', ['active','inactive'])->default('active');
            }

            // Tuỳ chọn: nếu bạn muốn điều kiện giá trị đơn tối thiểu
            if (!Schema::hasColumn('coupons', 'min_order_amount')) {
                // KHÔNG đặt "after(...)" để tránh phụ thuộc cột khác
                $t->decimal('min_order_amount', 12, 2)->default(0);
            }

            // Nếu CSDL cũ đang có cột active/is_active -> có thể bỏ qua
            // vì controller/model đã dùng "status". Nếu muốn migrate dữ liệu:
            // UPDATE coupons SET status = IF(active=1,'active','inactive') WHERE status IS NULL;
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $t) {
            if (Schema::hasColumn('coupons', 'min_order_amount')) $t->dropColumn('min_order_amount');
            if (Schema::hasColumn('coupons', 'status')) $t->dropColumn('status');
            if (Schema::hasColumn('coupons', 'expires_at')) $t->dropColumn('expires_at');
            if (Schema::hasColumn('coupons', 'starts_at')) $t->dropColumn('starts_at');
            if (Schema::hasColumn('coupons', 'max_uses')) $t->dropColumn('max_uses');
            if (Schema::hasColumn('coupons', 'used')) $t->dropColumn('used');
        });
    }
};
