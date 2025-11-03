<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $table = 'reviews';

    protected $fillable = [
        'product_id',
        'user_id',
        'rating',
        'content',
        'status',
        'verified_purchase',
    ];

    // ✅ ÉP KIỂU ỔN ĐỊNH
    protected $casts = [
        'rating'            => 'integer',
        'verified_purchase' => 'boolean',
        'created_at'        => 'datetime',
        'updated_at'        => 'datetime',
    ];

    // ✅ Trạng thái
    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    // ✅ Quan hệ
    public function product() { return $this->belongsTo(Product::class); }
    public function user()    { return $this->belongsTo(User::class); }
}
