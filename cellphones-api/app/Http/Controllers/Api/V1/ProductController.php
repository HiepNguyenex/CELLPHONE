<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class ProductController extends Controller
{
    /** ==============================
     *  Danh sách sản phẩm
     *  ============================== */
    public function index(Request $request)
    {
        $query = Product::query()
            ->with(['brand:id,name,slug', 'category:id,name,slug'])
            ->select(
                'id','name','slug','price','sale_price','image_url',
                'stock','category_id','brand_id','is_featured','created_at','specs'
            );

        // --- Tìm kiếm ---
        $search = trim((string) $request->get('search', $request->get('q', '')));
        if ($search !== '') {
            $query->where(function (Builder $q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // --- Bộ lọc ---
        $parseList = fn($value) =>
            is_array($value)
                ? array_values(array_filter(array_map('intval', $value)))
                : (is_string($value) ? array_values(array_filter(array_map('intval', explode(',', $value)))) : []);

        if ($ids = $parseList($request->get('ids'))) $query->whereIn('id', $ids);
        if ($catIds = $parseList($request->get('category_id', $request->get('category_ids')))) $query->whereIn('category_id', $catIds);
        if ($brandIds = $parseList($request->get('brand_id', $request->get('brand_ids')))) $query->whereIn('brand_id', $brandIds);

        if ($catSlugs = $request->get('category_slug', $request->get('category_slugs'))) {
            $slugs = is_array($catSlugs) ? $catSlugs : array_map('trim', explode(',', $catSlugs));
            $idsBySlug = Category::whereIn('slug', $slugs)->pluck('id');
            if ($idsBySlug->isNotEmpty()) $query->whereIn('category_id', $idsBySlug);
        }

        if ($brandSlugs = $request->get('brand_slug', $request->get('brand_slugs'))) {
            $slugs = is_array($brandSlugs) ? $brandSlugs : array_map('trim', explode(',', $brandSlugs));
            $query->whereHas('brand', fn($q) => $q->whereIn('slug', $slugs));
        }

        if ($request->filled('price_min')) $query->where('price', '>=', (float) $request->price_min);
        if ($request->filled('price_max')) $query->where('price', '<=', (float) $request->price_max);

        if ((int) $request->get('only_with_image', 0) === 1)
            $query->whereNotNull('image_url')->where('image_url', '!=', '');

        if ((int) $request->get('is_featured', 0) === 1)
            $query->where('is_featured', 1);

        // --- Sắp xếp ---
        $sort = $request->get('sort', '');
        switch ($sort) {
            case 'price_asc':  $query->orderBy('price', 'asc'); break;
            case 'price_desc': $query->orderBy('price', 'desc'); break;
            case 'oldest':     $query->orderBy('created_at', 'asc'); break;
            default:           $query->orderBy('created_at', 'desc'); break;
        }

        $perPage = max(6, min((int) $request->get('per_page', 24), 48));

        $products = $query->paginate($perPage);
        $products->getCollection()->transform(function ($item) {
            if (is_string($item->specs)) $item->specs = json_decode($item->specs, true) ?: null;
            return $item;
        });

        return response()->json($products);
    }

    /** ==============================
     *  Chi tiết sản phẩm
     *  ============================== */
    public function show(Request $request, $idOrSlug)
    {
        $product = Product::with([
                'brand:id,name,slug',
                'category:id,name,slug',
                'flashSales', // ✅ đã sửa
                'images:id,product_id,url,is_primary,position',
                'variants:id,product_id,sku,name,slug,attrs,price_override,sale_price_override,stock,is_default'
            ])
            ->when(is_numeric($idOrSlug),
                fn($q) => $q->where('id', $idOrSlug),
                fn($q) => $q->where('slug', $idOrSlug)
            )
            ->firstOrFail();

        // ✅ Flash Sale đang hoạt động
        $activeFlashSale = $product->flashSales
            ->first(fn($fs) => now()->between($fs->start_time, $fs->end_time) && ($fs->status === 'active' || !isset($fs->status)));

        if ($activeFlashSale) {
            $discount = $activeFlashSale->pivot->discount_percent ?? 0;
            $product->sale_price = (int) round($product->price * (1 - $discount / 100));
        }

        // fallback ảnh
        if ($product->images->isEmpty() && $product->image_url) {
            $product->setRelation('images', collect([[
                'id' => 0,
                'product_id' => $product->id,
                'url' => $product->image_url,
                'is_primary' => true,
                'position' => 0
            ]]));
        }

        // chọn biến thể
        $sel = $request->query('variant');
        $selectedVariant = null;
        if ($sel) {
            $selectedVariant = $product->variants->first(function ($v) use ($sel) {
                if (is_numeric($sel)) return (int)$sel === (int)$v->id;
                return (string)$v->slug === (string)$sel || (string)$v->sku === (string)$sel;
            });
        }
        if (!$selectedVariant)
            $selectedVariant = $product->variants->firstWhere('is_default', true) ?? $product->variants->first();

        $data = $product->toArray();
        $data['selected_variant'] = $selectedVariant ? [
            'id'          => $selectedVariant->id,
            'sku'         => $selectedVariant->sku,
            'name'        => $selectedVariant->name,
            'slug'        => $selectedVariant->slug,
            'attrs'       => $selectedVariant->attrs,
            'stock'       => $selectedVariant->stock,
            'is_default'  => $selectedVariant->is_default,
            'price'       => (int) ($selectedVariant->price_override ?? $product->price),
            'sale_price'  => $selectedVariant->sale_price_override !== null
                ? (int) $selectedVariant->sale_price_override
                : ($product->sale_price !== null ? (int)$product->sale_price : null),
            'final_price' => (int) ($selectedVariant->sale_price_override
                ?? $selectedVariant->price_override
                ?? $product->final_price),
        ] : null;

        return response()->json($data);
    }

    /** ==============================
     *  Sản phẩm liên quan
     *  ============================== */
    public function related($id)
    {
        $product = Product::findOrFail($id);

        $related = Product::query()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $id)
            ->take(6)
            ->get([
                'id','name','slug','price','sale_price',
                'image_url','category_id','brand_id','specs'
            ])
            ->transform(fn($item) => tap($item, function ($it) {
                if (is_string($it->specs)) $it->specs = json_decode($it->specs, true) ?: null;
            }));

        return response()->json($related);
    }

    /** ==============================
     *  Gợi ý sản phẩm
     *  ============================== */
    public function recommend(Request $request)
    {
        $brandId = $request->query('brand_id');
        $categoryId = $request->query('category_id');
        $exclude = $request->query('exclude', '');

        $query = Product::query()
            ->with(['brand:id,name,slug', 'category:id,name,slug'])
            ->select('id','name','slug','price','sale_price',
                'image_url','brand_id','category_id','is_featured','created_at','specs')
            ->where('stock', '>', 0);

        if ($brandId || $categoryId) {
            $query->where(function ($q) use ($brandId, $categoryId) {
                if ($brandId) $q->where('brand_id', $brandId);
                if ($categoryId) $q->orWhere('category_id', $categoryId);
            });
        }

        if (!empty($exclude)) {
            $ids = array_filter(array_map('intval', explode(',', $exclude)));
            if (!empty($ids)) $query->whereNotIn('id', $ids);
        }

        $products = $query->orderByDesc('is_featured')
            ->inRandomOrder()
            ->limit(8)
            ->get()
            ->transform(fn($it) => tap($it, function ($x) {
                if (is_string($x->specs)) $x->specs = json_decode($x->specs, true) ?: null;
            }));

        return response()->json(['status' => true, 'data' => $products]);
    }

    /** ==============================
     *  Gói “mua kèm”
     *  ============================== */
    public function bundles($id)
    {
        $product = Product::findOrFail($id);
        $bundles = $product->bundles()
            ->with(['brand:id,name', 'category:id,name'])
            ->take(10)
            ->get();

        return response()->json(['data' => $bundles]);
    }
}
