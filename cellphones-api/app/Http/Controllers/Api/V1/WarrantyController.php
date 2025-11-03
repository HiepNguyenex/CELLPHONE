<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WarrantyPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class WarrantyController extends Controller
{
    public function plans(Request $request)
    {
        $types = $request->filled('types')
            ? array_filter(array_map('trim', explode(',', $request->query('types'))))
            : null;

        // ✅ Tự nhận biết cột active
        $activeCol = Schema::hasColumn('warranty_plans', 'is_active') ? 'is_active'
                   : (Schema::hasColumn('warranty_plans', 'active') ? 'active' : null);

        $q = WarrantyPlan::query();
        if ($activeCol) {
            $q->where($activeCol, true);
        }

        if ($request->filled('product_id')) {
            $product = Product::find((int) $request->query('product_id'));
            if ($product) {
                $q->where(function ($x) use ($product) {
                    $x->where('product_id', $product->id)
                      ->orWhere(function ($x2) use ($product) {
                          $x2->whereNull('product_id')
                             ->where('category_id', $product->category_id);
                      })
                      ->orWhere(function ($x3) use ($product) {
                          $x3->whereNull('product_id')
                             ->where('brand_id', $product->brand_id);
                      })
                      ->orWhere(function ($x4) {
                          $x4->whereNull('product_id')
                             ->whereNull('category_id')
                             ->whereNull('brand_id');
                      });
                });
            } else {
                // fallback global
                $q->whereNull('product_id')
                  ->whereNull('category_id')
                  ->whereNull('brand_id');
            }
        }

        if ($types && count($types)) {
            $q->whereIn('type', $types);
        }

        $plans = $q->orderBy('type')->orderBy('months')->get([
            'id','product_id','category_id','brand_id',
            'name','type','months','price',
        ]);

        $data = $plans->map(fn($r) => [
            'id'     => (int) $r->id,
            'name'   => (string) $r->name,
            'months' => (int) ($r->months ?? 0),
            'price'  => (int) ($r->price ?? 0),
            'type'   => (string) ($r->type ?? ''),
            'active' => true, // đã lọc active ở trên
        ])->values();

        return response()->json(['data' => $data]);
    }
}
