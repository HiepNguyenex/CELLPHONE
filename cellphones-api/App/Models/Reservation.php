<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = ['store_id','product_id','customer_name','customer_phone','qty','expires_at','status'];
    protected $casts = ['expires_at' => 'datetime'];

    public function store(){ return $this->belongsTo(Store::class); }
    public function product(){ return $this->belongsTo(Product::class); }
}
