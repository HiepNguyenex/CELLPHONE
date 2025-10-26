<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        if (!Schema::hasTable('installment_plans')) {
            Schema::create('installment_plans', function (Blueprint $table) {
                $table->id();

                // method: credit (qua thẻ) | finance (công ty tài chính)
                $table->string('method'); // 'credit' | 'finance'
                $table->integer('months'); // 3/6/12/24

                // Lãi suất theo tháng (vd: 0.015 = 1.5%)
                $table->float('interest_monthly', 6, 4)->default(0);

                // % trả trước tối thiểu
                $table->integer('min_down_percent')->default(0);

                // true nếu 0% lãi suất
                $table->boolean('zero_percent')->default(false);

                // Nhà cung cấp (tuỳ chọn)
                $table->string('provider')->nullable();

                $table->boolean('active')->default(true);
                $table->timestamps();

                // ✅ UNIQUE để hỗ trợ upsert / onConflict (SQLite bắt buộc)
                $table->unique(['method', 'months', 'zero_percent']);

                $table->index(['method', 'months', 'active'], 'installment_method_months_active_idx');
                $table->index(['zero_percent', 'active'], 'installment_zero_active_idx');
            });
        }
    }

    public function down(): void {
        Schema::dropIfExists('installment_plans');
    }
};
