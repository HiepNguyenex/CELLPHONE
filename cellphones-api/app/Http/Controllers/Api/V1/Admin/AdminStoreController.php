<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRequest;
use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;

class AdminStoreController extends Controller
{
    /** Chỉ giữ lại những field mà bảng `stores` có thật sự */
    private function filterToStoreColumns(array $data): array
    {
        $cols = Schema::getColumnListing('stores');

        // Nếu bảng có cột slug thì tự sinh khi thiếu; nếu không có thì bỏ luôn key slug
        if (in_array('slug', $cols, true)) {
            if (empty($data['slug']) && !empty($data['name'])) {
                $data['slug'] = Str::slug($data['name']);
            }
        } else {
            unset($data['slug']);
        }

        // Nếu bảng không có is_active/phone thì loại
        if (!in_array('is_active', $cols, true)) unset($data['is_active']);
        if (!in_array('phone', $cols, true))     unset($data['phone']);

        // Chỉ trả về các key trùng với cột thực tế
        return array_intersect_key($data, array_flip($cols));
    }

    public function index(Request $request)
    {
        $q = Store::query();

        if ($kw = trim((string) $request->query('q', ''))) {
            $q->where(function ($x) use ($kw) {
                $x->where('name', 'like', "%{$kw}%")
                  ->orWhere('city', 'like', "%{$kw}%")
                  ->orWhere('address', 'like', "%{$kw}%");
            });
        }
        if ($request->filled('city')) {
            $q->where('city', $request->query('city'));
        }
        if ($request->filled('active') && Schema::hasColumn('stores', 'is_active')) {
            $q->where('is_active', (bool) $request->query('active'));
        }

        $q->orderBy('name');

        $perPage = (int) $request->query('per_page', 20);
        $perPage = max(10, min($perPage, 100));

        $pg = $q->paginate($perPage);

        return response()->json([
            'data' => $pg->items(),
            'meta' => [
                'total' => $pg->total(),
                'page'  => $pg->currentPage(),
                'last'  => $pg->lastPage(),
            ],
        ]);
    }

    public function store(StoreRequest $request)
    {
        $data  = $this->filterToStoreColumns($request->validated());
        $store = Store::create($data);

        return response()->json(['status' => true, 'data' => $store], 201);
    }

    public function show($id)
    {
        $store = Store::findOrFail($id);
        return response()->json(['data' => $store]);
    }

    public function update(StoreRequest $request, $id)
    {
        $store = Store::findOrFail($id);
        $data  = $this->filterToStoreColumns($request->validated());

        $store->update($data);

        return response()->json(['status' => true, 'data' => $store]);
    }

    public function destroy($id)
    {
        $store = Store::findOrFail($id);
        $store->delete();

        return response()->json(['status' => true]);
    }
}
