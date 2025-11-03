<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarrantyPlan extends Model
{
    use HasFactory;

    protected $table = 'warranty_plans';

    protected $fillable = [
        'product_id',
        'category_id',
        'brand_id',
        'name',
        'type',
        'months',
        'price',      // integer VND
        'is_active',  // ✅ dùng đúng cột trong migration
    ];

    protected $casts = [
        'months'    => 'integer',
        'price'     => 'integer',
        'is_active' => 'boolean',
    ];

    // Quan hệ cơ bản (tuỳ dự án có/không)
    public function product()  { return $this->belongsTo(Product::class); }
    public function category() { return $this->belongsTo(Category::class); }
    public function brand()    { return $this->belongsTo(Brand::class); }
}
