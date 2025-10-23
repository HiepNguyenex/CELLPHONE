<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    /** GET /api/v1/admin/products */
    public function index(Request $request)
    {
        $q = Product::query()
            ->with(['brand:id,name', 'category:id,name'])
            ->select('id','name','price','sale_price','stock','image_url','brand_id','category_id','created_at');

        if ($s = trim((string)$request->get('q'))) {
            $q->where(function ($x) use ($s) {
                $x->where('name', 'like', "%{$s}%")
                  ->orWhere('slug', 'like', "%{$s}%");
            });
        }

        if ($cid = $request->get('category_id')) $q->where('category_id', $cid);
        if ($bid = $request->get('brand_id'))    $q->where('brand_id', $bid);

        $q->latest('created_at');

        $limit = (int) $request->get('limit', 15);
        return $q->paginate(max(5, min($limit, 100)));
    }

    /** GET /api/v1/admin/products/{id} */
    public function show($id)
    {
        return Product::with(['brand:id,name', 'category:id,name'])->findOrFail($id);
    }

    /** POST /api/v1/admin/products (FormData) */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required','string','max:255'],
            'price'       => ['required','numeric','min:0'],
            'sale_price'  => ['nullable','numeric','min:0'],
            'stock'       => ['nullable','integer','min:0'],
            'category_id' => ['nullable','exists:categories,id'],
            'brand_id'    => ['nullable','exists:brands,id'],
            'specs'       => ['nullable'],
            // Ảnh:
            'image'       => ['nullable','image','mimes:jpg,jpeg,png','max:5120'], // ⚡ SỬA
            'image_url'   => ['nullable','url'],                                    // ✅ THÊM
        ]);

        // specs có thể là JSON string
        if (is_string($request->specs)) {
            $decoded = json_decode($request->specs, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $data['specs'] = $decoded;
            }
        }

        $data['slug'] = Str::slug($data['name']);

        // ✅ NHẬN CẢ 2 TRƯỜNG HỢP: FILE hoặc URL
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = "storage/{$path}";
        } elseif ($request->filled('image_url')) {
            $data['image_url'] = $request->input('image_url');
        }

        $p = Product::create($data);
        return response()->json($p->fresh(['brand:id,name', 'category:id,name']), 201);
    }

    /** POST /api/v1/admin/products/{id} (FormData) */
    public function update($id, Request $request)
    {
        $p = Product::findOrFail($id);

        $data = $request->validate([
            'name'        => ['sometimes','string','max:255'],
            'price'       => ['sometimes','numeric','min:0'],
            'sale_price'  => ['nullable','numeric','min:0'],
            'stock'       => ['sometimes','integer','min:0'],
            'category_id' => ['nullable','exists:categories,id'],
            'brand_id'    => ['nullable','exists:brands,id'],
            'specs'       => ['nullable'],
            // Ảnh:
            'image'       => ['nullable','image','mimes:jpg,jpeg,png','max:5120'], // ⚡ SỬA
            'image_url'   => ['nullable','url'],                                    // ✅ THÊM
        ]);

        if (is_string($request->specs)) {
            $decoded = json_decode($request->specs, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $data['specs'] = $decoded;
            }
        }

        if (!empty($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // ✅ Ưu tiên file; nếu không có file nhưng có URL thì cập nhật URL
        if ($request->hasFile('image')) {
            // dọn ảnh cũ nếu là file local
            if ($p->image_url && str_starts_with($p->image_url, 'storage/')) {
                $rel = Str::after($p->image_url, 'storage/');
                Storage::disk('public')->delete($rel);
            }
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = "storage/{$path}";
        } elseif ($request->filled('image_url')) {
            $data['image_url'] = $request->input('image_url');
        }

        $p->update($data);
        return response()->json($p->fresh(['brand:id,name', 'category:id,name']));
    }

    /** DELETE /api/v1/admin/products/{id} */
    public function destroy($id)
    {
        $p = Product::findOrFail($id);
        if ($p->image_url && str_starts_with($p->image_url, 'storage/')) {
            $rel = Str::after($p->image_url, 'storage/');
            Storage::disk('public')->delete($rel);
        }
        $p->delete();
        return response()->json(['deleted' => true]);
    }
}
