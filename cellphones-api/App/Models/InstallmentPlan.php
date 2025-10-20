<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InstallmentPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'method',             // credit | finance
        'months',             // 3/6/12/24
        'interest_monthly',   // 0.015 = 1.5%/tháng
        'min_down_percent',   // 0..70
        'zero_percent',       // bool
        'provider',           // tên đối tác (tuỳ chọn)
        'active',
    ];

    protected $casts = [
        'months'           => 'integer',
        'interest_monthly' => 'float',
        'min_down_percent' => 'integer',
        'zero_percent'     => 'boolean',
        'active'           => 'boolean',
    ];

    public function scopeActive($q)     { return $q->where('active', true); }
    public function scopeCredit($q)     { return $q->where('method', 'credit'); }
    public function scopeFinance($q)    { return $q->where('method', 'finance'); }
    public function scopeMonths($q, $m) { return $q->where('months', $m); }
}
