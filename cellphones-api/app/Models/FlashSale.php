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
        'status',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time'   => 'datetime',
    ];

    // ✅ Nhiều sản phẩm trong 1 Flash Sale
    public function products()
    {
        return $this->belongsToMany(Product::class, 'flash_sale_items')
            ->withPivot(['discount_percent'])
            ->withTimestamps();
    }

    // ✅ Kiểm tra Flash Sale đang hoạt động
    public function isActive(): bool
    {
        $now = now();
        return $this->status === 'active' && $this->start_time <= $now && $this->end_time >= $now;
    }
}
