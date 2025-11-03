<?php
// === FILE: database/seeders/NewsSeeder.php ===

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\News;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Local dev: cho phép reset sạch (MySQL/SQLite đều OK)
        if (app()->environment('local')) {
            Schema::disableForeignKeyConstraints();

            // SQLite không có TRUNCATE, dùng delete + reset sequence
            if (DB::getDriverName() === 'sqlite') {
                DB::table('news')->delete();
                // reset autoincrement của SQLite
                try {
                    DB::statement("DELETE FROM sqlite_sequence WHERE name='news'");
                } catch (\Throwable $e) {
                    // bỏ qua nếu không tồn tại
                }
            } else {
                // MySQL/Postgres
                News::truncate();
            }

            Schema::enableForeignKeyConstraints();

            News::factory()->count(15)->create();
            return;
        }

        // 2) Prod/Render: seed an toàn (idempotent) - chỉ seed nếu bảng trống
        if (News::count() === 0) {
            News::factory()->count(15)->create();
        } else {
            // optional: log nhẹ cho dễ theo dõi deploy
            $this->command?->info('News already seeded, skip.');
        }
    }
}
// === KẾT FILE: database/seeders/NewsSeeder.php ===
