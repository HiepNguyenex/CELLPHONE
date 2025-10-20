<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WarrantyPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'category_id',
        'brand_id',
        'name',
        'slug',
        'type',
        'months',
        'price',
        'active',
    ];

    protected $casts = [
        'months' => 'integer',
        'price'  => 'float',   // nếu bạn muốn lưu VND nguyên, đổi migration + cast thành 'integer'
        'active' => 'boolean',
    ];

    public function product()  { return $this->belongsTo(Product::class); }
    public function category() { return $this->belongsTo(Category::class); }
    public function brand()    { return $this->belongsTo(Brand::class); }

    public function scopeActive($q) { return $q->where('active', true); }

    public static function queryForProduct(Product $p)
    {
        return static::query()
            ->active()
            ->where(function ($q) use ($p) {
                $q->where('product_id', $p->id)
                  ->orWhere(function ($q2) use ($p) {
                      $q2->whereNull('product_id')
                         ->where('category_id', $p->category_id);
                  })
                  ->orWhere(function ($q3) use ($p) {
                      $q3->whereNull('product_id')
                         ->where('brand_id', $p->brand_id);
                  });
            });
    }
}
