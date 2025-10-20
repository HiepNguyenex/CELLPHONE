<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlashSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'discount_percent',
        'start_time',
        'end_time',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function isActive(): bool
    {
        $now = now();
        return $this->start_time <= $now && $this->end_time >= $now;
    }
}
