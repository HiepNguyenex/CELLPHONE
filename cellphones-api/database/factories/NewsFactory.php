<?php

namespace Database\Factories;

use App\Models\News;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Faker\Generator as Faker; // ✅ THÊM DÒNG NÀY

class NewsFactory extends Factory
{
    protected $model = News::class;

    // ✅ THÊM CONSTRUCTOR NÀY
    public function __construct(Faker $faker)
    {
        parent::__construct();
        $this->faker = $faker;
    }

    public function definition(): array
    {
        $title = $this->faker->sentence(mt_rand(6, 12));
        $slug  = Str::slug($title) . '-' . Str::lower(Str::random(6));

        $paras = $this->faker->paragraphs(mt_rand(4, 7));
        $html  = '<p>' . implode('</p><p>', $paras) . '</p>';

        $sources = [
            ['url' => 'https://vnexpress.net', 'name' => 'VnExpress'],
            ['url' => 'https://dantri.com.vn',  'name' => 'Dân Trí'],
            ['url' => 'https://thanhnien.vn',   'name' => 'Thanh Niên'],
            ['url' => 'https://tuoitre.vn',     'name' => 'Tuổi Trẻ'],
            ['url' => 'https://genk.vn',        'name' => 'GenK'],
            ['url' => 'https://cafebiz.vn',     'name' => 'CafeBiz'],
            ['url' => 'https://vtv.vn',         'name' => 'VTV'],
        ];
        $src = $sources[array_rand($sources)];
        $sourceUrl = rtrim($src['url'], '/') . '/' . $slug;

        return [
            'title'        => $title,
            'slug'         => $slug,
            'excerpt'      => $this->faker->text(140),
            'content_html' => $html,
            'image_url'    => 'https://picsum.photos/seed/' . $this->faker->numberBetween(1, 999999) . '/800/450',
            'source_url'   => $sourceUrl,
            'source_name'  => $src['name'],
            'published_at' => $this->faker->dateTimeBetween('-10 days', 'now'),
            'tags'         => json_encode(['tin tức', 'seed']),
            'status'       => 'publish',
        ];
    }
}
