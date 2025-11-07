<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;

class ChatSession extends Model
{
    use Prunable;

    // Dùng UUID làm khóa chính
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id','user_id','status','last_activity_at','expires_at','meta'
    ];

    protected $casts = [
        'last_activity_at' => 'datetime',
        'expires_at'       => 'datetime',
        'meta'             => 'array',
    ];

    public function messages()
    {
        return $this->hasMany(ChatMessage::class, 'chat_session_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && now()->greaterThan($this->expires_at);
    }

    public function prunable()
    {
        return static::whereNotNull('expires_at')->where('expires_at', '<', now());
    }
}
