<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class AdminFlashSaleController extends Controller
{
    // 📦 Lấy danh sách tất cả flash sale
    public function index(Request $request)
    {
        $query = FlashSale::with('product:id,name,price,image_url');

        if ($request->has('status')) {
            $now = now();
            if ($request->status === 'active') {
                $query->where('start_time', '<=', $now)
                      ->where('end_time', '>=', $now);
            } elseif ($request->status === 'upcoming') {
                $query->where('start_time', '>', $now);
            } elseif ($request->status === 'expired') {
                $query->where('end_time', '<', $now);
            }
        }

        $sales = $query->latest()->paginate(10);
        return response()->json($sales);
    }

    // 👁️ Xem chi tiết 1 flash sale
    public function show($id)
    {
        $sale = FlashSale::with('product:id,name,price,image_url')->findOrFail($id);
        return response()->json($sale);
    }

    // ➕ Thêm flash sale mới
    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id'       => ['required', 'exists:products,id'],
            'discount_percent' => ['required', 'numeric', 'min:1', 'max:90'],
            'start_time'       => ['required', 'date'],
            'end_time'         => ['required', 'date', 'after:start_time'],
        ]);

        // Tránh trùng flash sale cho 1 sản phẩm trong thời gian giao nhau
        $overlap = FlashSale::where('product_id', $data['product_id'])
            ->where(function($q) use ($data) {
                $q->whereBetween('start_time', [$data['start_time'], $data['end_time']])
                  ->orWhereBetween('end_time', [$data['start_time'], $data['end_time']]);
            })->exists();

        if ($overlap) {
            return response()->json(['message' => 'Sản phẩm này đã có Flash Sale trùng thời gian!'], 422);
        }

        $sale = FlashSale::create($data);
        return response()->json(['message' => 'Tạo Flash Sale thành công', 'sale' => $sale], 201);
    }

    // ✏️ Cập nhật flash sale
    public function update(Request $request, $id)
    {
        $sale = FlashSale::findOrFail($id);
        $data = $request->validate([
            'product_id'       => ['required', 'exists:products,id'],
            'discount_percent' => ['required', 'numeric', 'min:1', 'max:90'],
            'start_time'       => ['required', 'date'],
            'end_time'         => ['required', 'date', 'after:start_time'],
        ]);

        $sale->update($data);
        return response()->json(['message' => 'Cập nhật Flash Sale thành công', 'sale' => $sale]);
    }

    // ❌ Xóa flash sale
    public function destroy($id)
    {
        $sale = FlashSale::findOrFail($id);
        $sale->delete();
        return response()->json(['message' => 'Đã xóa Flash Sale']);
    }
}
