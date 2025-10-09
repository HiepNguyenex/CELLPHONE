// app/Models/Brand.php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Brand extends Model
{
    use HasFactory;

    protected $fillable = ['name','slug','logo','description','is_active','sort_order'];
    protected $casts = ['is_active'=>'boolean','sort_order'=>'integer'];

    public function products() {
        return $this->hasMany(Product::class);
    }
}
