<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\QueryException;

class AdminCategoryController extends Controller
{
    public function index(Request $request)
    {
        $q = Category::query()
            ->select('id','name','slug','parent_id','icon','is_active','sort_order','description')
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($kw = trim((string) $request->get('q', '')))
            $q->where('name', 'like', "%{$kw}%");

        return response()->json($q->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'slug' => 'nullable|string|max:160|unique:categories,slug',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
            'description' => 'nullable|string',
        ]);

        if ($request->hasFile('icon')) {
            $data['icon'] = $request->file('icon')->store('categories', 'public');
        }

        $cat = Category::create($data);
        return response()->json(['message' => 'Tạo danh mục thành công', 'data' => $cat], 201);
    }

    public function update(Request $request, $id)
    {
        $cat = Category::findOrFail($id);
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'slug' => 'nullable|string|max:160|unique:categories,slug,' . $cat->id,
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'is_active' => 'boolean',
            'sort_order' => 'integer|min:0',
            'description' => 'nullable|string',
        ]);

        if ($request->hasFile('icon')) {
            if ($cat->icon && Storage::disk('public')->exists($cat->icon))
                Storage::disk('public')->delete($cat->icon);
            $data['icon'] = $request->file('icon')->store('categories', 'public');
        }

        $cat->update($data);
        return response()->json(['message' => 'Cập nhật thành công', 'data' => $cat]);
    }

    public function destroy($id)
    {
        $cat = Category::withCount('products')->findOrFail($id);
        if ($cat->products_count > 0)
            return response()->json(['message' => 'Không thể xóa danh mục có sản phẩm'], 422);

        if ($cat->icon && Storage::disk('public')->exists($cat->icon))
            Storage::disk('public')->delete($cat->icon);

        $cat->delete();
        return response()->json(['message' => 'Đã xóa danh mục']);
    }
}
