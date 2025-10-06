<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'parent_id'];

    /*------------ Relations ------------*/
    public function products()
    {
        return $this->hasMany(\App\Models\Product::class, 'category_id');
    }

    /*------------ Auto slug ------------*/
    protected static function booted()
    {
        // Tạo slug khi tạo mới nếu chưa có
        static::creating(function (Category $c) {
            if (empty($c->slug)) {
                $c->slug = static::uniqueSlug($c->name);
            }
        });

        // Nếu đổi name mà slug trống (không gửi slug) thì sinh lại (tuỳ chính sách)
        static::updating(function (Category $c) {
            if ($c->isDirty('name') && empty($c->slug)) {
                $c->slug = static::uniqueSlug($c->name, $c->id);
            }
        });
    }

    protected static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'dm';
        $slug = $base; $i = 1;

        $q = static::where('slug', $slug);
        if ($ignoreId) $q->where('id', '!=', $ignoreId);

        while ($q->exists()) {
            $slug = $base.'-'.$i++;
            $q = static::where('slug', $slug);
            if ($ignoreId) $q->where('id', '!=', $ignoreId);
        }
        return $slug;
    }
}
