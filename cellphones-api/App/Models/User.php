<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Thuộc tính có thể gán hàng loạt
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',   // 'admin' | 'user'
        'status', // 'active' | 'banned' (tùy bạn thêm cột này trong migration)
    ];

    /**
     * Ẩn khi trả về JSON
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Ép kiểu dữ liệu
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    /**
     * Tự động append thuộc tính custom khi serialize
     */
    protected $appends = ['is_admin'];

    /**
     * Accessor: kiểm tra xem có phải admin không
     */
    public function getIsAdminAttribute(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Quan hệ: 1 user có nhiều order
     */
    public function orders()
    {
        return $this->hasMany(\App\Models\Order::class);
    }
}
