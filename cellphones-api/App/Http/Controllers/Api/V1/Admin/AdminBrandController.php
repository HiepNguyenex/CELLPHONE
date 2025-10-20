<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminBrandController extends Controller
{
    /** GET /api/v1/admin/brands */
    public function index(Request $request)
    {
        $q = Brand::query()->orderBy('sort_order')->orderBy('name');

        if ($search = trim((string)$request->get('q'))) {
            $q->where(function($x) use ($search){
                $x->where('name','like',"%{$search}%")
                  ->orWhere('slug','like',"%{$search}%");
            });
        }

        $limit = max(5, min((int)$request->integer('limit', 15), 100));
        return $q->paginate($limit);
    }

    /** GET /api/v1/admin/brands/{id} */
    public function show($id)
    {
        return Brand::findOrFail($id);
    }

    /** POST /api/v1/admin/brands  (FormData) */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => ['required','string','max:120'],
            'slug'        => ['nullable','string','max:160','unique:brands,slug'],
            'description' => ['nullable','string'],
            'is_active'   => ['nullable','boolean'],
            'sort_order'  => ['nullable','integer','min:0'],
            // hỗ trợ upload hoặc URL
            'logo'        => ['nullable','image','mimes:jpg,jpeg,png,webp','max:4096'],
            'logo_url'    => ['nullable','url'],
        ]);

        if (empty($data['slug'])) $data['slug'] = Str::slug($data['name']);
        $data['is_active'] = (bool)($data['is_active'] ?? true);
        $data['sort_order'] = (int)($data['sort_order'] ?? 0);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('brands', 'public'); // brands/xxx.png
        } elseif ($request->filled('logo_url')) {
            $data['logo'] = $request->input('logo_url'); // http(s) absolute
        }

        $brand = Brand::create($data);
        return response()->json($brand, 201);
    }

    /** POST /api/v1/admin/brands/{id}  (FormData) */
    public function update($id, Request $request)
    {
        $brand = Brand::findOrFail($id);
        $data = $request->validate([
            'name'        => ['sometimes','string','max:120'],
            'slug'        => ['nullable','string','max:160','unique:brands,slug,'.$brand->id],
            'description' => ['nullable','string'],
            'is_active'   => ['nullable','boolean'],
            'sort_order'  => ['nullable','integer','min:0'],
            'logo'        => ['nullable','image','mimes:jpg,jpeg,png,webp','max:4096'],
            'logo_url'    => ['nullable','url'],
        ]);

        if (!empty($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // cập nhật logo (file ưu tiên, nếu không có file mà có URL thì dùng URL)
        if ($request->hasFile('logo')) {
            if ($brand->logo && !preg_match('#^https?://#i', $brand->logo)) {
                Storage::disk('public')->delete($brand->logo);
            }
            $data['logo'] = $request->file('logo')->store('brands', 'public');
        } elseif ($request->filled('logo_url')) {
            if ($brand->logo && !preg_match('#^https?://#i', $brand->logo)) {
                Storage::disk('public')->delete($brand->logo);
            }
            $data['logo'] = $request->input('logo_url');
        }

        $brand->update($data);
        return response()->json($brand->fresh());
    }

    /** DELETE /api/v1/admin/brands/{id} */
    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        // chỉ xóa file local, không chạm URL ngoài
        if ($brand->logo && !preg_match('#^https?://#i', $brand->logo)) {
            Storage::disk('public')->delete($brand->logo);
        }
        $brand->delete();
        return response()->json(['deleted' => true]);
    }
}
