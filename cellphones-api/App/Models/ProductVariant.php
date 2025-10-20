<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'slug',
        'attrs',
        'price_override',
        'sale_price_override',
        'stock',
        'is_default',
    ];

    protected $casts = [
        'attrs' => 'array',
        'is_default' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getFinalPriceAttribute(): int
    {
        return (int) ($this->sale_price_override ?? $this->price_override ?? $this->product?->final_price ?? 0);
    }
}
