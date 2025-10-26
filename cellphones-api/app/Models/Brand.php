<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = ['name','slug','logo','description','is_active','sort_order'];
    protected $casts = ['is_active'=>'boolean','sort_order'=>'integer'];

    // Trả về URL tuyệt đối cho FE
    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo) return null;
        if (Str::startsWith($this->logo, ['http://','https://'])) return $this->logo;
        return asset('storage/' . ltrim($this->logo, '/'));
    }

    public function products() {
        return $this->hasMany(Product::class);
    }

    /* Auto-slug */
    protected static function booted()
    {
        static::creating(function (Brand $b) {
            if (empty($b->slug)) $b->slug = static::uniqueSlug($b->name);
        });

        static::updating(function (Brand $b) {
            if ($b->isDirty('name') && empty($b->slug)) {
                $b->slug = static::uniqueSlug($b->name, $b->id);
            }
        });
    }

    protected static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'brand';
        $slug = $base; $i = 1;

        while (static::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id','!=',$ignoreId))
            ->exists()) {
            $slug = $base . '-' . $i++;
        }
        return $slug;
    }
}
