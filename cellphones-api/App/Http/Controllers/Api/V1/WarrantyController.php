<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\WarrantyPlan;
use Illuminate\Http\Request;

class WarrantyController extends Controller
{
    // GET /api/v1/warranty/plans?product_id=ID&types=extended,accident,combo
    public function plans(Request $request)
    {
        $types = $request->filled('types')
            ? array_filter(array_map('trim', explode(',', $request->query('types'))))
            : null;

        $q = WarrantyPlan::query()->where('active', true);

        // Ưu tiên: theo product / category / brand + FALLBACK: global (mọi nơi)
        if ($request->filled('product_id')) {
            $p = Product::find((int) $request->query('product_id'));
            if ($p) {
                $q->where(function ($x) use ($p) {
                    $x->where('product_id', $p->id)
                      ->orWhere(function ($x2) use ($p) {
                          $x2->whereNull('product_id')->where('category_id', $p->category_id);
                      })
                      ->orWhere(function ($x3) use ($p) {
                          $x3->whereNull('product_id')->where('brand_id', $p->brand_id);
                      })
                      // 👇 thêm fallback GLOBAL: không gắn gì cả
                      ->orWhere(function ($x4) {
                          $x4->whereNull('product_id')
                             ->whereNull('category_id')
                             ->whereNull('brand_id');
                      });
                });
            } else {
                // Nếu product_id không tồn tại → chỉ global
                $q->whereNull('product_id')->whereNull('category_id')->whereNull('brand_id');
            }
        }

        if ($types && count($types)) {
            $q->whereIn('type', $types);
        }

        $plans = $q->orderBy('type')->orderBy('months')
            ->get(['id','name','months','price','type','active']);

        $data = $plans->map(function ($r) {
            return [
                'id'     => (int) $r->id,
                'name'   => (string) $r->name,
                'months' => (int) $r->months,
                'price'  => (int) round((float)$r->price),
                'type'   => (string) $r->type, // extended | accident | combo | (nếu bạn lưu label VN thì FE vẫn hiển thị được)
                'active' => (bool) $r->active,
            ];
        })->values();

        return response()->json(['data' => $data]);
    }
}
