<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class OrderStatusHistory extends Model
{
    use HasFactory;

    protected $fillable = ['order_id','admin_id','from_status','to_status','note'];

    public function order() { return $this->belongsTo(Order::class); }
    public function admin() { return $this->belongsTo(User::class, 'admin_id'); }
}
