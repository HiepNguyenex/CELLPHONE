<?php
namespace Database\Factories;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;


class ProductFactory extends Factory
{
protected $model = Product::class;
public function definition(): array
{
$name = $this->faker->words(3, true);
return [
'category_id' => 1,
'brand_id' => 1,
'name' => Str::title($name),
'slug' => Str::slug($name.'-'.Str::random(6)),
'price' => $this->faker->numberBetween(3000000, 30000000),
'sale_price' => $this->faker->randomElement([null, $this->faker->numberBetween(2500000, 28000000)]),
'thumbnail_url' => 'https://picsum.photos/seed/'.Str::random(8).'/600/600',
'stock' => $this->faker->numberBetween(0, 200),
'is_featured' => $this->faker->boolean(45),
'specs' => [
'ram' => $this->faker->randomElement(['4GB','6GB','8GB','12GB']),
'storage' => $this->faker->randomElement(['64GB','128GB','256GB','512GB']),
'screen' => $this->faker->randomElement(['6.1"','6.5"','6.7"']),
],
'short_description' => $this->faker->sentence(14),
];
}
}