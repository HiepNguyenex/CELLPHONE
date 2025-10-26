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
        'content',     // ✅ dùng "content" để khớp FE/Controller
        'status',      // pending / approved / rejected
        'is_approved', // (optional) nếu sẵn cột cũ, không dùng cũng không sao
    ];

    // Trạng thái
    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    // Quan hệ
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeStatus($query, $status = null)
    {
        if (!empty($status)) {
            $query->where('status', $status);
        }
        return $query;
    }

    public function scopeKeyword($query, $keyword = null)
    {
        if (!empty($keyword)) {
            $query->where('content', 'like', "%{$keyword}%");
        }
        return $query;
    }

    // Helper nhãn
    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING  => 'Chờ duyệt',
            self::STATUS_APPROVED => 'Đã duyệt',
            self::STATUS_REJECTED => 'Từ chối',
            default               => ucfirst((string) $this->status),
        };
    }

    // Giá trị mặc định khi tạo mới (nếu migration không set default)
    protected $attributes = [
        'status' => self::STATUS_PENDING,
    ];
}
