<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminProductImageController extends Controller
{
    public function index($productId)
    {
        $product = Product::findOrFail($productId);
        return response()->json([
            'status' => true,
            'data'   => $product->images()->get(),
        ]);
    }

    public function store(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);

        $request->validate([
            'url'        => ['nullable','string','max:1000'],
            'image'      => ['nullable','file','image','max:5120'], // 5MB
            'is_primary' => ['nullable', Rule::in([0,1,'0','1',true,false])],
        ]);

        if (!$request->hasFile('image') && !$request->filled('url')) {
            return response()->json(['message' => 'Thiếu ảnh upload hoặc url'], 422);
        }

        $url = $request->input('url');

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $url  = '/storage/' . $path;
        }

        $img = ProductImage::create([
            'product_id' => $product->id,
            'url'        => $url,
            'is_primary' => (bool)$request->boolean('is_primary'),
            'position'   => (int)($product->images()->max('position') ?? 0) + 1,
        ]);

        // Nếu là ảnh chính -> clear các ảnh khác
        if ($img->is_primary) {
            ProductImage::where('product_id',$product->id)
                ->where('id','!=',$img->id)
                ->update(['is_primary'=>false]);
        }

        return response()->json(['status'=>true,'data'=>$img], 201);
    }

    public function destroy($imageId)
    {
        $img = ProductImage::findOrFail($imageId);

        // nếu là file trong storage -> thử xóa
        if (str_starts_with($img->url, '/storage/')) {
            $rel = str_replace('/storage/', '', $img->url);
            if (Storage::disk('public')->exists($rel)) {
                Storage::disk('public')->delete($rel);
            }
        }

        $img->delete();
        return response()->json(['status'=>true]);
    }

    public function reorder(Request $request, $productId)
    {
        $request->validate([
            'ids' => ['required','array','min:1'],
            'ids.*' => ['integer','exists:product_images,id'],
        ]);

        $ids = $request->input('ids');
        foreach ($ids as $pos => $id) {
            ProductImage::where('id', $id)->where('product_id', $productId)->update(['position' => $pos]);
        }

        return response()->json(['status'=>true]);
    }

    public function setPrimary($imageId)
    {
        $img = ProductImage::findOrFail($imageId);
        ProductImage::where('product_id', $img->product_id)->update(['is_primary'=>false]);
        $img->is_primary = true;
        $img->save();

        return response()->json(['status'=>true]);
    }
}
