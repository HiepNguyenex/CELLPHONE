<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; // ✅ THÊM

class News extends Model
{
    use HasFactory; // ✅ THÊM

    protected $table = 'news';

    protected $fillable = [
        'title','slug','excerpt','content_html','image_url',
        'source_url','source_name','published_at','tags','status'
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'tags' => 'array',
    ];
}
