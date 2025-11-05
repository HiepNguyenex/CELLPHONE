<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('flash_sales', function (Blueprint $table) {
            $table->id();

            // 🔖 Tên chương trình flash sale
            $table->string('name')
                  ->unique()
                  ->comment('Tên chương trình Flash Sale');

            // 📝 Mô tả chương trình (bổ sung mới)
            $table->text('description')
                  ->nullable()
                  ->comment('Mô tả chi tiết chương trình Flash Sale');

            // 🕒 Thời gian bắt đầu / kết thúc
            $table->timestamp('start_time')
                  ->nullable()
                  ->comment('Thời gian bắt đầu');

            $table->timestamp('end_time')
                  ->nullable()
                  ->comment('Thời gian kết thúc');

            // ⚙️ Trạng thái kích hoạt
            $table->boolean('is_active')
                  ->default(true)
                  ->comment('Trạng thái kích hoạt');

            $table->timestamps();
        });

        echo "✅ Created table: flash_sales\n";
    }

    public function down(): void
    {
        Schema::dropIfExists('flash_sales');
    }
};
