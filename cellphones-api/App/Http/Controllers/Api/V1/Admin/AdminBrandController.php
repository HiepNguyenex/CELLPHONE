<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BrandStoreRequest;
use App\Http\Requests\Admin\BrandUpdateRequest;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class AdminBrandController extends Controller
{
    /** GET /api/v1/admin/brands */
    public function index(Request $request)
    {
        $q = Brand::query()->orderBy('sort_order')->orderBy('name');

        if ($search = $request->get('q')) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('slug', 'like', "%{$search}%");
        }

        return $q->paginate($request->integer('limit', 15));
    }

    /** GET /api/v1/admin/brands/{id} */
    public function show($id)
    {
        return Brand::findOrFail($id);
    }

    /** POST /api/v1/admin/brands  (FormData) */
    public function store(BrandStoreRequest $request)
    {
        $data = $request->validated();
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('brands', 'public');
        }

        $brand = Brand::create($data);
        return response()->json($brand, 201);
    }

    /** POST /api/v1/admin/brands/{id}  (FormData) */
    public function update($id, BrandUpdateRequest $request)
    {
        $brand = Brand::findOrFail($id);
        $data = $request->validated();

        if (!empty($data['name']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        if ($request->hasFile('logo')) {
            if ($brand->logo) Storage::disk('public')->delete($brand->logo);
            $data['logo'] = $request->file('logo')->store('brands', 'public');
        }

        $brand->update($data);
        return response()->json($brand);
    }

    /** DELETE /api/v1/admin/brands/{id} */
    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        if ($brand->logo) Storage::disk('public')->delete($brand->logo);
        $brand->delete();
        return response()->json(['deleted' => true]);
    }
}