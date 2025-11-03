<?php
// === FILE: database/seeders/NewsSeeder.php ===

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\News;
use Illuminate\Support\Facades\DB;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        // ⚠️ Tuỳ chọn: xoá sạch để tránh vướng unique cũ
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        News::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        News::factory()->count(15)->create();
    }
}
// === KẾT FILE: database/seeders/NewsSeeder.php ===
