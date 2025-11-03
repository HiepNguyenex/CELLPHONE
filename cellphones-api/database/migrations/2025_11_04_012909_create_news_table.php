<?php
// === FILE: database/migrations/2025_11_04_000000_create_news_table.php ===

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('news', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->string('slug', 180)->unique();
            $table->string('excerpt', 500)->nullable();
            $table->text('content_html');                  // Nội dung HTML đã làm sạch
            $table->string('image_url', 500)->nullable();
            $table->string('source_url', 500)->nullable()->unique();
            $table->string('source_name', 120)->nullable();
            $table->timestamp('published_at')->nullable()->index();
            $table->json('tags')->nullable();
            $table->enum('status', ['draft','publish'])->default('publish')->index();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('news');
    }
};
// === KẾT FILE: database/migrations/2025_11_04_000000_create_news_table.php ===
