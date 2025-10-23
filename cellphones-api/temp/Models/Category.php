<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'parent_id',
        'icon', 'is_active', 'sort_order', 'description'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // (tùy chọn) xuất thêm trường icon_url tuyệt đối
    protected $appends = ['icon_url'];

    public function getIconUrlAttribute(): ?string
    {
        if (!$this->icon) return null;
        if (Str::startsWith($this->icon, ['http://','https://'])) return $this->icon;
        return asset('storage/' . ltrim($this->icon, '/'));
    }

    /*------------ Quan hệ ------------*/
    public function parent()  { return $this->belongsTo(Category::class, 'parent_id'); }
    public function children(){ return $this->hasMany(Category::class, 'parent_id'); }
    public function products(){ return $this->hasMany(\App\Models\Product::class, 'category_id'); }

    /*------------ Tự động sinh slug ------------*/
    protected static function booted()
    {
        static::creating(function (Category $c) {
            if (empty($c->slug)) $c->slug = static::uniqueSlug($c->name);
        });
        static::updating(function (Category $c) {
            if ($c->isDirty('name') && empty($c->slug))
                $c->slug = static::uniqueSlug($c->name, $c->id);
        });
    }

    protected static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'dm';
        $slug = $base; $i = 1;

        while (static::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
