<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id','code','name','email','phone','address',
        'subtotal','shipping','discount','total','status',
        'note','payment_method','shipping_method','payment_status',
        'coupon_code', // ✅ THÊM
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function histories()
    {
        return $this->hasMany(OrderStatusHistory::class)->latest();
    }

    protected static function booted(): void
    {
        static::creating(function (self $order) {
            if (!$order->code) {
                $order->code = 'ORD' . now()->format('YmdHis') . rand(100, 999);
            }
        });
    }
}
