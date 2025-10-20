<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Product;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    /** GET /api/v1/brands */
    public function index(Request $request)
    {
        $q = Brand::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($search = trim((string)$request->get('q'))) {
            $q->where('name','like',"%{$search}%");
        }

        // model đã appends logo_url => FE dùng trực tiếp
        return response()->json(
            $q->get(['id','name','slug','logo','description'])
        );
    }

    /** GET /api/v1/brands/{slug} */
    public function show($slug, Request $request)
    {
        $brand = Brand::where('slug', $slug)->firstOrFail();

        $query = Product::with(['category:id,name,slug','brand:id,name,slug'])
            ->select('id','name','slug','price','sale_price','image_url','brand_id','category_id')
            ->where('brand_id', $brand->id);

        if ($request->filled('category_id')) {
            $query->where('category_id', (int) $request->category_id);
        }

        switch ($request->get('sort')) {
            case 'price_asc':  $query->orderBy('price','asc'); break;
            case 'price_desc': $query->orderBy('price','desc'); break;
            default:           $query->orderByDesc('id'); break;
        }

        $products = $query->paginate((int) $request->get('per_page', 12));

        return response()->json([
            'brand'    => $brand,     // có brand.logo_url
            'products' => $products,
        ]);
    }
}
