<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('installment_plans')) {
            Schema::create('installment_plans', function (Blueprint $table) {
                $table->id();

                // method: credit (qua thẻ) | finance (công ty tài chính)
                $table->string('method'); // 'credit' | 'finance'
                $table->unsignedSmallInteger('months'); // 3/6/12/24

                // Lãi suất theo tháng, ví dụ 0.015 = 1.5%/tháng
                $table->decimal('interest_monthly', 6, 4)->default(0); // 0.0000 ~ 9.9999

                // % trả trước tối thiểu
                $table->unsignedTinyInteger('min_down_percent')->default(0); // 0..70

                // true nếu 0% lãi suất (áp dụng cho "credit" một số kỳ hạn)
                $table->boolean('zero_percent')->default(false);

                // Nhà cung cấp (tùy chọn)
                $table->string('provider')->nullable(); // "Home Credit", "FE Credit", ...

                $table->boolean('active')->default(true);

                $table->timestamps();

                $table->index(['method', 'months', 'active'], 'installment_method_months_active_idx');
                $table->index(['zero_percent', 'active'], 'installment_zero_active_idx');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('installment_plans');
    }
};
