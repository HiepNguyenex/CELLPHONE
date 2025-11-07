<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlashSaleItem extends Model
{
    use HasFactory;

    protected $table = 'flash_sale_items';

    protected $fillable = [
        'flash_sale_id',
        'product_id',
        'sale_price',
        'discount_percent',
        'is_active',
        'is_featured', // 🚀 BỔ SUNG: Cột Nổi bật
    ];

    protected $casts = [
        'is_featured' => 'boolean', // 🚀 BỔ SUNG: Cast cho Nổi bật
    ];

    // =========================
    // QUAN HỆ
    // =========================
    public function flashSale()
    {
        return $this->belongsTo(FlashSale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // =========================
    // ACCESSOR: TÍNH GIÁ SAU GIẢM
    // =========================
    public function getFinalPriceAttribute(): float
    {
        return $this->sale_price ?? ($this->product->price * (1 - $this->discount_percent / 100));
    }
}