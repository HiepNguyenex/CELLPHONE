<?php

// app/Models/ChatMessage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = ['chat_session_id', 'sender', 'message'];

    // Một tin nhắn thuộc về một phiên chat
    public function session()
    {
        return $this->belongsTo(ChatSession::class, 'chat_session_id');
    }
}