<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class ProductController extends Controller
{
    /**
     * GET /api/v1/products
     * Hỗ trợ tìm kiếm, lọc, phân trang, sort
     */
    public function index(Request $request)
    {
        $query = Product::query()
            ->with(['brand:id,name', 'category:id,name,slug'])
            ->select('id','name','price','sale_price','image_url','stock','category_id','brand_id','created_at');

        /* ========== Search (keyword or q) ========== */
        $search = trim((string) $request->get('search', $request->get('q','')));
        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        /* Helper: parse list từ chuỗi "1,2,3" hoặc mảng [1,2,3] */
        $parseList = function ($value) {
            if (is_array($value)) return array_values(array_filter(array_map('intval', $value)));
            if (is_string($value)) return array_values(array_filter(array_map('intval', explode(',', $value))));
            return [];
        };

        /* ========== Filters ========== */
        if ($ids = $parseList($request->get('ids'))) {
            $query->whereIn('id', $ids);
        }

        if ($catIds = $parseList($request->get('category_id', $request->get('category_ids')))) {
            $query->whereIn('category_id', $catIds);
        }

        if ($catSlugs = $request->get('category_slug', $request->get('category_slugs'))) {
            $slugs = is_array($catSlugs) ? $catSlugs : array_map('trim', explode(',', $catSlugs));
            $idsBySlug = Category::whereIn('slug', $slugs)->pluck('id');
            if ($idsBySlug->isNotEmpty()) {
                $query->whereIn('category_id', $idsBySlug);
            }
        }

        if ($brandIds = $parseList($request->get('brand_id', $request->get('brand_ids')))) {
            $query->whereIn('brand_id', $brandIds);
        }

        // Khoảng giá (price_min, price_max)
        if ($request->filled('price_min')) {
            $query->where('price', '>=', (float) $request->price_min);
        }
        if ($request->filled('price_max')) {
            $query->where('price', '<=', (float) $request->price_max);
        }

        // Chỉ lấy sản phẩm có ảnh
        if ((int) $request->get('only_with_image', 0) === 1) {
            $query->whereNotNull('image_url')->where('image_url', '!=', '');
        }

        // Sản phẩm nổi bật
        if ((int) $request->get('is_featured', 0) === 1) {
            $query->where('is_featured', 1);
        }

        /* ========== Sort ========== */
        $sort = $request->get('sort', '');
        $legacyOrder = $request->get('order_by');

        if ($sort) {
            switch ($sort) {
                case 'price_asc':  $query->orderBy('price', 'asc'); break;
                case 'price_desc': $query->orderBy('price', 'desc'); break;
                case 'oldest':     $query->orderBy('created_at', 'asc'); break;
                case 'newest':
                default:           $query->orderBy('created_at', 'desc'); break;
            }
        } elseif ($legacyOrder) {
            $query->orderBy('created_at', strtolower($legacyOrder) === 'desc' ? 'desc' : 'asc');
        } else {
            $query->latest();
        }

        /* ========== Pagination ========== */
        $perPage = (int) $request->get('per_page', 24);
        $perPage = max(6, min($perPage, 48));

        return response()->json($query->paginate($perPage));
    }

    /**
     * GET /api/v1/products/{idOrSlug}
     */
    public function show($idOrSlug)
    {
        $product = Product::with(['brand:id,name', 'category:id,name,slug'])
            ->when(is_numeric($idOrSlug),
                fn($q) => $q->where('id', $idOrSlug),
                fn($q) => $q->where('slug', $idOrSlug)
            )
            ->firstOrFail();

        return response()->json($product);
    }
}
