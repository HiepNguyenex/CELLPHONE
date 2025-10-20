<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\WarrantyPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminWarrantyController extends Controller
{
    // GET /v1/admin/warranties
    public function index(Request $request)
    {
        $q = WarrantyPlan::query();

        if ($kw = trim((string) $request->query('q', ''))) {
            $q->where('name', 'like', "%{$kw}%")
              ->orWhere('slug', 'like', "%{$kw}%")
              ->orWhere('type', 'like', "%{$kw}%");
        }

        if ($request->filled('type')) {
            $q->where('type', $request->query('type'));
        }

        if ($request->filled('active')) {
            $q->where('active', (bool) $request->query('active'));
        }

        $q->orderBy('type')->orderBy('months')->orderBy('id');

        // Trả mảng đơn giản để FE .map() không lỗi
        $rows = $q->get();

        return response()->json($rows);
    }

    // POST /v1/admin/warranties
    public function store(Request $r)
    {
        $data = $r->validate([
            'name'        => ['required','string','max:255'],
            'months'      => ['required','integer','min:1','max:60'],
            'price'       => ['required','numeric','min:0'],
            'active'      => ['sometimes','boolean'],
            'type'        => ['sometimes','string','max:50'],
            'product_id'  => ['nullable','integer','exists:products,id'],
            'category_id' => ['nullable','integer','exists:categories,id'],
            'brand_id'    => ['nullable','integer','exists:brands,id'],
        ]);

        $data['type']   = $data['type']   ?? 'extended';
        $data['active'] = $data['active'] ?? true;

        // tạo slug duy nhất từ name
        $base = Str::slug($data['name']) ?: 'plan';
        $slug = $base;
        $i = 1;
        while (WarrantyPlan::where('slug', $slug)->exists()) {
            $slug = $base.'-'.$i++;
        }
        $data['slug'] = $slug;

        $plan = WarrantyPlan::create($data);

        return response()->json(['status' => true, 'data' => $plan], 201);
    }

    // GET /v1/admin/warranties/{id}
    public function show($id)
    {
        $plan = WarrantyPlan::findOrFail($id);
        return response()->json(['data' => $plan]);
    }

    // POST /v1/admin/warranties/{id}
    public function update(Request $r, $id)
    {
        $plan = WarrantyPlan::findOrFail($id);

        $data = $r->validate([
            'name'        => ['sometimes','string','max:255'],
            'months'      => ['sometimes','integer','min:1','max:60'],
            'price'       => ['sometimes','numeric','min:0'],
            'active'      => ['sometimes','boolean'],
            'type'        => ['sometimes','string','max:50'],
            'product_id'  => ['nullable','integer','exists:products,id'],
            'category_id' => ['nullable','integer','exists:categories,id'],
            'brand_id'    => ['nullable','integer','exists:brands,id'],
        ]);

        // nếu có đổi name mà không truyền slug → làm slug mới (không required)
        if (array_key_exists('name', $data) && empty($data['slug'])) {
            $base = Str::slug($data['name']) ?: 'plan';
            $slug = $base;
            $i = 1;
            while (WarrantyPlan::where('slug', $slug)->where('id', '<>', $plan->id)->exists()) {
                $slug = $base.'-'.$i++;
            }
            $data['slug'] = $slug;
        }

        $plan->update($data);

        return response()->json(['status' => true, 'data' => $plan]);
    }

    // DELETE /v1/admin/warranties/{id}
    public function destroy($id)
    {
        $plan = WarrantyPlan::findOrFail($id);
        $plan->delete();

        return response()->json(['status' => true]);
    }
}
