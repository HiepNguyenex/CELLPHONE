<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::withCount('products')
                ->orderBy('name')
                ->get(['id', 'name', 'slug'])
        );
    }

    /**
     * GET /api/v1/categories/{slug}
     * Hiển thị chi tiết category + danh sách sản phẩm
     */
    public function show($slug, Request $request)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $query = Product::with(['brand:id,name,slug'])
            ->select('id','name','slug','price','sale_price','image_url','brand_id','category_id')
            ->where('category_id', $category->id);

        // Bộ lọc tùy chọn
        if ($request->filled('brand_id')) {
            $query->where('brand_id', (int)$request->brand_id);
        }

        if ($request->filled('sort')) {
            switch ($request->sort) {
                case 'price_asc':  $query->orderBy('price', 'asc'); break;
                case 'price_desc': $query->orderBy('price', 'desc'); break;
                case 'newest': default: $query->orderByDesc('id'); break;
            }
        }

        $products = $query->paginate($request->get('per_page', 12));

        return response()->json([
            'category' => $category,
            'products' => $products,
        ]);
    }
}
