<?php
// === FILE: database/factories/NewsFactory.php ===

namespace Database\Factories;

use App\Models\News;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class NewsFactory extends Factory
{
    protected $model = News::class;

    public function definition(): array
    {
        $title   = $this->faker->unique()->sentence(8);
        $slug    = Str::limit(Str::slug($title) . '-' . Str::lower(Str::random(6)), 180, '');

        // Nguồn tiếng Việt
        $domains = [
            ['host' => 'vnexpress.net',  'name' => 'VnExpress'],
            ['host' => 'zingnews.vn',    'name' => 'ZingNews'],
            ['host' => 'tuoitre.vn',     'name' => 'Tuổi Trẻ'],
            ['host' => 'thanhnien.vn',   'name' => 'Thanh Niên'],
            ['host' => 'genk.vn',        'name' => 'GenK'],
            ['host' => 'dantri.com.vn',  'name' => 'Dân Trí'],
            ['host' => 'vietnamnet.vn',  'name' => 'VietNamNet'],
        ];
        $pick = $this->faker->randomElement($domains);

        // Tạo URL bài viết giả lập, DUY NHẤT
        $path = 'tin-tuc/' . $slug . '-' . Str::lower(Str::random(8)) . '.html';
        $sourceUrl = 'https://' . $pick['host'] . '/' . $path;

        return [
            'title'        => $title,
            'slug'         => $slug,
            'excerpt'      => $this->faker->text(160),
            'content_html' => '<p>' . implode('</p><p>', $this->faker->paragraphs(5)) . '</p>',
            'image_url'    => 'https://picsum.photos/seed/' . $this->faker->unique()->numberBetween(1, 999999) . '/800/450',
            'source_url'   => $sourceUrl,               // ✅ luôn unique
            'source_name'  => $pick['name'],            // ✅ tiếng Việt
            'published_at' => now()->subDays($this->faker->numberBetween(0, 14))
                               ->subMinutes($this->faker->numberBetween(0, 1440)),
            'tags'         => ['tin tức', 'seed'],
            'status'       => 'publish',
        ];
    }
}
// === KẾT FILE: database/factories/NewsFactory.php ===
