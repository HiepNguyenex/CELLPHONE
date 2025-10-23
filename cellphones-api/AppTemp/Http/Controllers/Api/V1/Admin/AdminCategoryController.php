<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    /** GET /api/v1/admin/categories */
    public function index(Request $request)
    {
        $q = Category::query()
            ->select('id','name','slug','parent_id','icon','is_active','sort_order','description')
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($kw = trim((string) $request->get('q', ''))) {
            $q->where('name', 'like', "%{$kw}%");
        }

        return response()->json($q->get());
    }

    /** GET /api/v1/admin/categories/{id} */
    public function show($id)
    {
        return response()->json(Category::findOrFail($id));
    }

    /** POST /api/v1/admin/categories (FormData) */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:120',
            'slug'        => 'nullable|string|max:160|unique:categories,slug',
            'parent_id'   => 'nullable|exists:categories,id',
            'icon'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'icon_url'    => 'nullable|url',                    // ✅ thêm: nhận URL ngoài
            'is_active'   => 'boolean',
            'sort_order'  => 'integer|min:0',
            'description' => 'nullable|string',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // ✅ Ưu tiên file, nếu không có thì nhận URL
        if ($request->hasFile('icon')) {
            $data['icon'] = $request->file('icon')->store('categories', 'public'); // lưu relative path
        } elseif ($request->filled('icon_url')) {
            $data['icon'] = $request->input('icon_url'); // có thể là http(s) absolute
        }

        $cat = Category::create($data);
        return response()->json(['message' => 'Tạo danh mục thành công', 'data' => $cat], 201);
    }

    /** POST /api/v1/admin/categories/{id} (FormData) */
    public function update(Request $request, $id)
    {
        $cat = Category::findOrFail($id);

        $data = $request->validate([
            'name'        => 'required|string|max:120',
            'slug'        => 'nullable|string|max:160|unique:categories,slug,' . $cat->id,
            'parent_id'   => 'nullable|exists:categories,id',
            'icon'        => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'icon_url'    => 'nullable|url',                    // ✅ thêm
            'is_active'   => 'boolean',
            'sort_order'  => 'integer|min:0',
            'description' => 'nullable|string',
        ]);

        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // ✅ Nếu gửi file → lưu mới; nếu gửi URL → cập nhật URL
        if ($request->hasFile('icon')) {
            if ($cat->icon && !preg_match('#^https?://#i', $cat->icon)) {
                Storage::disk('public')->delete($cat->icon);
            }
            $data['icon'] = $request->file('icon')->store('categories', 'public');
        } elseif ($request->filled('icon_url')) {
            if ($cat->icon && !preg_match('#^https?://#i', $cat->icon)) {
                Storage::disk('public')->delete($cat->icon);
            }
            $data['icon'] = $request->input('icon_url');
        }

        $cat->update($data);
        return response()->json(['message' => 'Cập nhật thành công', 'data' => $cat->fresh()]);
    }

    /** DELETE /api/v1/admin/categories/{id} */
    public function destroy($id)
    {
        $cat = Category::withCount('products')->findOrFail($id);
        if ($cat->products_count > 0) {
            return response()->json(['message' => 'Không thể xóa danh mục có sản phẩm'], 422);
        }

        if ($cat->icon && !preg_match('#^https?://#i', $cat->icon)) {
            Storage::disk('public')->delete($cat->icon);
        }

        $cat->delete();
        return response()->json(['message' => 'Đã xóa danh mục']);
    }
}
