<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItemAddon extends Model
{
    use HasFactory;

    protected $table = 'order_item_addons';

    protected $fillable = [
        'order_item_id',
        'warranty_plan_id',
        'name',
        'type',
        'months',
        'price', // snapshot đơn giá addon tại thời điểm mua (per-unit)
    ];

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
