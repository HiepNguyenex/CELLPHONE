<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;

class AdminProductVariantController extends Controller
{
    /**
     * GET /api/v1/admin/products/{productId}/variants
     */
    public function index($productId, Request $request)
    {
        $product = Product::findOrFail($productId);

        $q = ProductVariant::query()
            ->where('product_id', $product->id)
            ->orderBy('position')
            ->orderBy('id', 'asc');

        if ($kw = trim((string) $request->get('q', ''))) {
            $q->where(function ($x) use ($kw) {
                $x->where('name', 'like', "%{$kw}%")
                  ->orWhere('sku', 'like', "%{$kw}%")
                  ->orWhere('slug', 'like', "%{$kw}%");
            });
        }

        $variants = $q->get();

        return response()->json([
            'status'   => true,
            'product'  => [
                'id'   => $product->id,
                'name' => $product->name,
            ],
            'data'     => $variants,
        ]);
    }

    /**
     * GET /api/v1/admin/product-variants/{variantId}
     */
    public function show($variantId)
    {
        $variant = ProductVariant::with('product:id,name')->findOrFail($variantId);
        return response()->json(['status' => true, 'data' => $variant]);
    }

    /**
     * POST /api/v1/admin/products/{productId}/variants
     */
    public function store($productId, Request $request)
    {
        $product = Product::findOrFail($productId);

        $data = $this->validated($request, $product->id);

        // Tự sinh slug nếu trống
        if (empty($data['slug'])) {
            $data['slug'] = $this->uniqueSlug($data['name'] ?: ($product->name.'-variant'), $product->id);
        }

        $data['product_id'] = $product->id;

        $variant = ProductVariant::create($data);

        return response()->json([
            'status' => true,
            'message' => 'Created',
            'data' => $variant
        ], 201);
    }

    /**
     * POST /api/v1/admin/product-variants/{variantId}
     */
    public function update($variantId, Request $request)
    {
        $variant = ProductVariant::findOrFail($variantId);
        $data = $this->validated($request, $variant->product_id, $variant->id);

        // nếu đổi name mà slug trống => sinh lại
        if (($data['name'] ?? null) && empty($data['slug'])) {
            $data['slug'] = $this->uniqueSlug($data['name'], $variant->product_id, $variant->id);
        }

        $variant->fill($data)->save();

        return response()->json([
            'status' => true,
            'message' => 'Updated',
            'data' => $variant->fresh()
        ]);
    }

    /**
     * DELETE /api/v1/admin/product-variants/{variantId}
     */
    public function destroy($variantId)
    {
        $variant = ProductVariant::findOrFail($variantId);
        $variant->delete();

        return response()->json(['status' => true, 'message' => 'Deleted']);
    }

    /**
     * POST /api/v1/admin/products/{productId}/variants/bulk-upsert
     * Body:
     * {
     *   "variants": [
     *     {"id": 1, "name": "...", "price": 123, "stock": 10, ...},
     *     {"name": "...", "price": 456, "stock": 5, ...}
     *   ]
     * }
     */
    public function bulkUpsert($productId, Request $request)
    {
        $product = Product::findOrFail($productId);
        $items   = $request->input('variants', []);

        if (!is_array($items) || empty($items)) {
            return response()->json(['status' => false, 'message' => 'No variants provided.'], 422);
        }

        $result = [
            'created' => [],
            'updated' => [],
            'errors'  => [],
        ];

        DB::beginTransaction();
        try {
            foreach ($items as $i => $raw) {
                try {
                    $id   = $raw['id'] ?? null;
                    $data = $this->validated(new Request($raw), $product->id, $id, true); // skip required on bulk

                    if ($id) {
                        $variant = ProductVariant::where('product_id', $product->id)->findOrFail($id);
                        // auto slug
                        if (($data['name'] ?? null) && empty($data['slug'])) {
                            $data['slug'] = $this->uniqueSlug($data['name'], $product->id, $variant->id);
                        }
                        $variant->fill($data)->save();
                        $result['updated'][] = $variant->id;
                    } else {
                        if (empty($data['slug'])) {
                            $data['slug'] = $this->uniqueSlug($data['name'] ?? ($product->name.'-variant'), $product->id);
                        }
                        $data['product_id'] = $product->id;
                        $variant = ProductVariant::create($data);
                        $result['created'][] = $variant->id;
                    }
                } catch (\Throwable $e) {
                    $result['errors'][] = [
                        'index' => $i,
                        'message' => $e->getMessage(),
                    ];
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['status' => false, 'message' => $e->getMessage()], 500);
        }

        return response()->json(['status' => true, 'data' => $result]);
    }

    // =========================
    // Helpers
    // =========================
    protected function validated(Request $request, int $productId, ?int $variantId = null, bool $bulk = false): array
    {
        // $bulk === true: nới lỏng required để cho phép upsert từng phần
        $nameRule  = $bulk ? ['nullable','string','max:255'] : ['nullable','string','max:255'];
        $priceRule = $bulk ? ['nullable','numeric','min:0'] : ['required','numeric','min:0'];

        return $request->validate([
            'name'        => $nameRule,
            'slug'        => [
                'nullable','string','max:255',
                Rule::unique('product_variants', 'slug')->where('product_id', $productId)->ignore($variantId),
            ],
            'sku'         => ['nullable','string','max:100'],
            'options'     => ['nullable'], // string hoặc array (json), tùy migration của bạn
            'price'       => $priceRule,
            'sale_price'  => ['nullable','numeric','min:0','lte:price'],
            'stock'       => ['nullable','integer','min:0'],
            'image_url'   => ['nullable','string','max:2048'],
            'is_active'   => ['nullable','boolean'],
            'position'    => ['nullable','integer','min:0'],
        ]);
    }

    protected function uniqueSlug(string $baseName, int $productId, ?int $ignoreId = null): string
    {
        $base = Str::slug($baseName) ?: 'v';
        $slug = $base;
        $i    = 1;

        $exists = ProductVariant::where('product_id', $productId)
            ->where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists();

        while ($exists) {
            $slug = $base . '-' . $i++;
            $exists = ProductVariant::where('product_id', $productId)
                ->where('slug', $slug)
                ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
                ->exists();
        }

        return $slug;
    }
}
