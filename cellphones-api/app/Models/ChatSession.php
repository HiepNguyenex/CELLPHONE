<?php

// app/Models/ChatSession.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatSession extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'session_uuid'];

    // Một phiên chat có nhiều tin nhắn
    public function messages()
    {
        return $this->hasMany(ChatMessage::class);
    }

    // (Tùy chọn) Thuộc về user nào
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}