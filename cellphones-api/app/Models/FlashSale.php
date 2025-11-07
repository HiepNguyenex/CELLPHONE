<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlashSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_time',
        'end_time',
        'is_active', // Cột trạng thái đã được thống nhất
        'banner_image_url', 
        'description',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
        'is_active'  => 'boolean',
    ];

  // ✅ Nhiều sản phẩm trong 1 Flash Sale
    public function products()
    {
        return $this->belongsToMany(Product::class, 'flash_sale_items')
            // 🚀 FIX LỖI: Bổ sung 'id' của bảng pivot vào withPivot
            ->withPivot(['id', 'sale_price', 'discount_percent', 'is_featured']) 
            ->withTimestamps();
    }
}