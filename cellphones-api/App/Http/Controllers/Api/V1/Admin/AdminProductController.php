<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductStoreRequest;
use App\Http\Requests\Admin\ProductUpdateRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    // ==============================
    // 🔹 Lấy danh sách sản phẩm
    // ==============================
    public function index(Request $request)
    {
        $q = Product::query()
            ->select('id', 'name', 'price', 'sale_price', 'image_url', 'stock', 'created_at')
            ->orderByDesc('id');

        if ($kw = trim((string) $request->get('q', ''))) {
            $q->where('name', 'like', "%{$kw}%");
        }

        return response()->json(
            $q->paginate((int) $request->get('per_page', 20))
        );
    }

    // ==============================
    // 🔹 Tạo mới sản phẩm
    // ==============================
    public function store(ProductStoreRequest $request)
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = asset('storage/' . $path);
        }

        $product = Product::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Tạo sản phẩm thành công',
            'data' => $product
        ], 201);
    }

    // ==============================
    // 🔹 Xem chi tiết sản phẩm
    // ==============================
    public function show($id)
    {
        $product = Product::findOrFail($id);
        return response()->json($product);
    }

    // ==============================
    // 🔹 Cập nhật sản phẩm
    // ==============================
    public function update(ProductUpdateRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($product->image_url && str_contains($product->image_url, '/storage/')) {
                $old = str_replace(asset('storage') . '/', '', $product->image_url);
                Storage::disk('public')->delete($old);
            }
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = asset('storage/' . $path);
        }

        $product->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product
        ]);
    }

    // ==============================
    // 🔹 Xóa sản phẩm (có kiểm tra đơn hàng)
    // ==============================
    public function destroy($id)
    {
        $product = Product::withCount('orderItems')->findOrFail($id);

        // 🔒 Nếu sản phẩm đã có trong đơn hàng => Không cho xóa
        if ($product->order_items_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa sản phẩm vì đã tồn tại trong đơn hàng.',
            ], 422);
        }

        try {
            // Xóa ảnh nếu có
            if ($product->image_url && str_contains($product->image_url, '/storage/')) {
                $old = str_replace(asset('storage') . '/', '', $product->image_url);
                Storage::disk('public')->delete($old);
            }

            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Xóa sản phẩm thành công.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa sản phẩm. Lỗi ràng buộc hoặc hệ thống.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
}
