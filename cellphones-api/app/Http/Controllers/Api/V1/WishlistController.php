<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    // GET /api/v1/wishlist
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $items = WishlistItem::with(['product:id,name,price,image_url'])
            ->where('user_id', $userId)
            ->latest()
            ->get();

        $data = $items->map(function ($row) {
            return [
                'product_id' => $row->product_id,
                'name'       => $row->product->name,
                'price'      => (int)$row->product->price,
                'image_url'  => $row->product->image_url,
            ];
        });

        return response()->json(['data' => $data]);
    }

    // POST /api/v1/wishlist  { product_id }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
        ]);

        WishlistItem::firstOrCreate([
            'user_id'    => $request->user()->id,
            'product_id' => $validated['product_id'],
        ]);

        return response()->json(['message' => 'Added to wishlist'], 201);
    }

    // DELETE /api/v1/wishlist/{productId}
    public function destroy(Request $request, $productId)
    {
        $row = WishlistItem::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->first();

        if (!$row) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $row->delete();
        return response()->json(['message' => 'Removed']);
    }
}
