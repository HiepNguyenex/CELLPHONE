<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'price',
        'sale_price',
        'image_url',
        'stock',
        'is_featured',
        'specs',
        'short_description',
        'description',
    ];

    protected $casts = [
        'specs' => 'array',
        'is_featured' => 'boolean',
    ];

    protected $appends = ['final_price'];

    // ==============================
    // 🔹 Quan hệ
    // ==============================
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // ==============================
    // 🔹 Accessors
    // ==============================
    public function getFinalPriceAttribute(): int
    {
        return (int) ($this->sale_price ?? $this->price);
    }

    // ==============================
    // 🔹 Sự kiện tự động
    // ==============================
    protected static function booted()
    {
        static::creating(function (Product $p) {
            if (empty($p->slug)) {
                $p->slug = static::uniqueSlug($p->name);
            }
        });

        static::updating(function (Product $p) {
            if ($p->isDirty('name') && empty($p->slug)) {
                $p->slug = static::uniqueSlug($p->name, $p->id);
            }
        });
    }

    /** 🔹 Sinh slug duy nhất */
    protected static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'sp';
        $slug = $base;
        $i = 1;

        $query = static::where('slug', $slug);
        if ($ignoreId) $query->where('id', '!=', $ignoreId);

        while ($query->exists()) {
            $slug = $base . '-' . $i++;
            $query = static::where('slug', $slug);
            if ($ignoreId) $query->where('id', '!=', $ignoreId);
        }

        return $slug;
    }

    // ==============================
    // 🔹 Query Scopes (lọc / sắp xếp)
    // ==============================
    public function scopeKeyword($q, $kw)
    {
        if (!$kw) return $q;
        $kw = trim($kw);
        return $q->where(function ($x) use ($kw) {
            $x->where('name', 'like', "%{$kw}%")
              ->orWhere('slug', 'like', "%{$kw}%");
        });
    }

    public function scopeCategory($q, $categoryId)
    {
        if ($categoryId) $q->where('category_id', $categoryId);
        return $q;
    }

    public function scopeBrand($q, $brandId)
    {
        if ($brandId) $q->where('brand_id', $brandId);
        return $q;
    }

    public function scopePriceRange($q, $min, $max)
    {
        if (is_numeric($min)) $q->where('price', '>=', (float)$min);
        if (is_numeric($max)) $q->where('price', '<=', (float)$max);
        return $q;
    }

    public function scopeSortBy($q, $sort)
    {
        return match ($sort) {
            'price_asc'  => $q->orderBy('price', 'asc'),
            'price_desc' => $q->orderBy('price', 'desc'),
            'newest'     => $q->orderBy('id', 'desc'),
            default       => $q->orderBy('id', 'desc'),
        };
    }
}
