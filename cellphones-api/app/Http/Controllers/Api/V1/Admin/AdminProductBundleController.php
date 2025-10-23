<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminProductBundleController extends Controller
{
    /** GET /v1/admin/products/{productId}/bundles */
    public function index($productId)
    {
        $product = Product::findOrFail((int)$productId);

        // trả về tối thiểu các field FE đang dùng
        $rows = DB::table('product_bundle')
            ->where('product_id', $product->id)
            ->orderBy('bundle_product_id')
            ->get([
                DB::raw('bundle_product_id as id'),
                'bundle_product_id',
                'discount_percent',
                DB::raw('is_active as active'),
            ]);

        return response()->json([
            'product_id' => (int) $product->id,
            'bundles'    => $rows->map(function ($r) {
                return [
                    'id'               => (int) $r->id,                 // cho FE tiện hiển thị
                    'bundle_product_id'=> (int) $r->bundle_product_id,  // trường “gốc”
                    'discount_percent' => (int) ($r->discount_percent ?? 0),
                    'active'           => (bool) ($r->active ?? true),
                ];
            })->values(),
        ]);
    }

    /** POST /v1/admin/products/{productId}/bundles/upsert */
    public function upsert(Request $request, $productId)
    {
        $product = Product::findOrFail((int)$productId);

        $data = $request->validate([
            'items'   => ['required','array','min:1'],
            'items.*.bundle_product_id' => ['required','integer','exists:products,id','different:product_id'],
            'items.*.discount_percent'  => ['nullable','integer','min:0','max:90'],
            'items.*.active'            => ['sometimes','boolean'], // FE có thể gửi active; DB dùng is_active
        ]);

        $items = $data['items'];

        DB::transaction(function () use ($items, $product) {
            foreach ($items as $raw) {
                $bundleId = (int) $raw['bundle_product_id'];
                if ($bundleId === (int)$product->id) {
                    throw ValidationException::withMessages([
                        'items' => ['Không thể bundle chính sản phẩm.'],
                    ]);
                }
                DB::table('product_bundle')->updateOrInsert(
                    ['product_id' => $product->id, 'bundle_product_id' => $bundleId],
                    [
                        'discount_percent' => (int)($raw['discount_percent'] ?? 0),
                        'is_active'        => array_key_exists('active', $raw) ? (bool)$raw['active'] : true,
                        'updated_at'       => now(),
                        'created_at'       => now(),
                    ]
                );
            }
        });

        return response()->json(['status' => true]);
    }

    /** DELETE /v1/admin/products/{productId}/bundles/{bundleProductId} */
    public function detach($productId, $bundleProductId)
    {
        $product = Product::findOrFail((int)$productId);

        DB::table('product_bundle')
            ->where('product_id', $product->id)
            ->where('bundle_product_id', (int)$bundleProductId)
            ->delete();

        return response()->json(['status' => true]);
    }
}
