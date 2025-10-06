<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryStoreRequest;
use App\Http\Requests\Admin\CategoryUpdateRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class AdminCategoryController extends Controller
{
    // GET /api/v1/admin/categories
    public function index(Request $request)
    {
        $q = Category::query()->select('id', 'name', 'slug')->orderByDesc('id');

        if ($kw = trim((string) $request->get('q', ''))) {
            $q->where('name', 'like', "%{$kw}%");
        }

        return response()->json(
            $q->paginate((int) $request->get('per_page', 50))
        );
    }

    // POST /api/v1/admin/categories
    public function store(CategoryStoreRequest $request)
    {
        $cat = Category::create($request->validated());

        return response()->json([
            'message' => 'Tạo danh mục thành công',
            'data'    => $cat
        ], 201);
    }

    // GET /api/v1/admin/categories/{id}
    public function show($id)
    {
        return response()->json(Category::findOrFail($id));
    }

    // POST /api/v1/admin/categories/{id}
    public function update(CategoryUpdateRequest $request, $id)
    {
        $cat = Category::findOrFail($id);
        $cat->update($request->validated());

        return response()->json([
            'message' => 'Cập nhật thành công',
            'data'    => $cat
        ]);
    }

    // DELETE /api/v1/admin/categories/{id}
    public function destroy($id)
    {
        $cat = Category::withCount('products')->findOrFail($id);

        // ✅ Chặn xóa nếu còn sản phẩm
        if ($cat->products_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục vì vẫn còn sản phẩm trong danh mục này.',
            ], 422);
        }

        try {
            $cat->delete();
            return response()->json([
                'success' => true,
                'message' => 'Đã xóa danh mục thành công.',
            ]);
        } catch (QueryException $e) {
            // ✅ Phòng trường hợp lỗi khóa ngoại bất ngờ
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục (liên quan dữ liệu khác).',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
