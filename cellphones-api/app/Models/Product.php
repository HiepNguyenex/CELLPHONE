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
        'promotions',
        'short_description',
        'description',
    ];

    protected $casts = [
        'specs'       => 'array',
        'promotions'  => 'array',
        'is_featured' => 'boolean',
    ];

    protected $appends = ['final_price'];

    // ==============================
    // Quan hệ
    // ==============================
    public function category()     { return $this->belongsTo(Category::class); }
    public function brand()        { return $this->belongsTo(Brand::class); }
    public function orderItems()   { return $this->hasMany(OrderItem::class); }
    public function reviews()      { return $this->hasMany(Review::class); }

    // ✅ Chuẩn hóa: 1 sản phẩm có thể thuộc nhiều Flash Sale
    public function flashSales()
    {
        return $this->belongsToMany(FlashSale::class, 'flash_sale_items')
            ->withPivot(['discount_percent'])
            ->withTimestamps();
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)
            ->orderBy('is_primary', 'desc')
            ->orderBy('position')
            ->orderBy('id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class)
            ->orderByDesc('is_default')
            ->orderBy('id');
    }

    // Bundles (pivot product_bundle)
    public function bundles()
    {
        return $this->belongsToMany(Product::class, 'product_bundle', 'product_id', 'bundle_product_id')
            ->withPivot(['discount_percent', 'is_active'])
            ->withTimestamps();
    }

    public function includedInBundles()
    {
        return $this->belongsToMany(Product::class, 'product_bundle', 'bundle_product_id', 'product_id')
            ->withPivot(['discount_percent', 'is_active'])
            ->withTimestamps();
    }

    public function inventories()  { return $this->hasMany(Inventory::class); }

    public function stores()
    {
        return $this->belongsToMany(Store::class, 'inventories', 'product_id', 'store_id')
            ->withPivot(['stock'])
            ->withTimestamps();
    }

    public function warrantyPlans() { return $this->hasMany(WarrantyPlan::class); }

    // ==============================
    // Accessors
    // ==============================
    public function getFinalPriceAttribute(): int
    {
        return (int) ($this->sale_price ?? $this->price);
    }

    public function getImageAbsoluteUrlAttribute(): ?string
    {
        if (!$this->image_url) return null;
        if (Str::startsWith($this->image_url, ['http://', 'https://'])) return $this->image_url;
        return asset($this->image_url);
    }

    // ==============================
    // Hooks (sinh slug tự động)
    // ==============================
    protected static function booted()
    {
        static::creating(function (Product $p) {
            if (empty($p->slug)) $p->slug = static::uniqueSlug($p->name);
        });

        static::updating(function (Product $p) {
            if ($p->isDirty('name') && empty($p->slug)) {
                $p->slug = static::uniqueSlug($p->name, $p->id);
            }
        });
    }

    protected static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'sp';
        $slug = $base;
        $i = 1;

        $exists = static::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists();

        while ($exists) {
            $slug = $base . '-' . $i++;
            $exists = static::where('slug', $slug)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists();
        }

        return $slug;
    }

    // ==============================
    // Scopes
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
            default      => $q->orderBy('id', 'desc'),
        };
    }
}
