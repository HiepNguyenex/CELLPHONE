<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;

class ProductBundleController extends Controller
{
    // GET /api/v1/products/{id}/bundles
    public function index($id)
    {
        $product = Product::findOrFail($id);

        $bundles = $product->bundles()->with('brand:id,name','category:id,name')->get()
            ->map(function (Product $b) use ($product) {
                $pivot = $b->pivot;
                $baseA = $product->final_price;
                $baseB = $b->final_price;
                $comboPrice = $baseA + $baseB;

                $discount = 0;
                if ($pivot->discount_amount)  $discount += (int) $pivot->discount_amount;
                if ($pivot->discount_percent) $discount += (int) round($comboPrice * $pivot->discount_percent / 100);

                $finalCombo = max(0, $comboPrice - $discount);
                $percent = $comboPrice > 0 ? round($discount / $comboPrice * 100) : 0;

                return [
                    'bundle_product' => [
                        'id'        => $b->id,
                        'name'      => $b->name,
                        'image_url' => $b->image_url,
                        'price'     => $baseB,
                        'brand'     => $b->brand?->name,
                        'category'  => $b->category?->name,
                    ],
                    'discount_amount'  => $discount,
                    'discount_percent' => $percent,
                    'combo_price'      => $finalCombo,
                ];
            });

        return response()->json([
            'product_id' => $product->id,
            'base_price' => $product->final_price,
            'bundles'    => $bundles,
        ]);
    }
}
