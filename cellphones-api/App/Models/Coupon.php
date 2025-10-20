<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'discount', 'max_uses', 'used',
        'starts_at', 'expires_at', 'status', 'min_order_amount',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'expires_at'=> 'datetime',
        'discount'  => 'float',
        'min_order_amount' => 'float',
    ];

    public function isValid(float $subtotal = 0): bool
    {
        if ($this->status !== 'active') return false;

        $now = Carbon::now();
        if ($this->starts_at && $now->lt($this->starts_at)) return false;
        if ($this->expires_at && $now->gt($this->expires_at)) return false;

        if ($this->max_uses !== null && $this->used >= $this->max_uses) return false;

        if ($this->min_order_amount && $subtotal < $this->min_order_amount) return false;

        return true;
    }

    public function markUsed(): void
    {
        $this->increment('used');
    }
}
