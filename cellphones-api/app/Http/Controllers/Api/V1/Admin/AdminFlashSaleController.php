<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FlashSale;
// use App\Models\Product; // Chúng ta sẽ quản lý Product ở một controller khác
use Illuminate\Support\Facades\DB;

class AdminFlashSaleController extends Controller
{
    /**
     * ✅ SỬA: Lấy danh sách SỰ KIỆN (không phải sản phẩm)
     */
    public function index(Request $request)
    {
        $query = FlashSale::query(); // Bỏ with('product')

        if ($request->has('status')) {
            $now = now();
            if ($request->status === 'active') {
                $query->where('start_time', '<=', $now)
                      ->where('end_time', '>=', $now)
                      ->where('is_active', true); // Thêm check is_active
            } elseif ($request->status === 'upcoming') {
                $query->where('start_time', '>', $now)
                      ->where('is_active', true);
            } elseif ($request->status === 'expired') {
                $query->where('end_time', '<', $now);
            }
        }

        // Sắp xếp theo thời gian bắt đầu
        $sales = $query->latest('start_time')->paginate(10);
        return response()->json($sales);
    }

    /**
     * 👁️ Xem chi tiết 1 SỰ KIỆN
     */
    public function show($id)
    {
        // ✅ SỬA: Bỏ with('product')
        $sale = FlashSale::findOrFail($id);
        return response()->json($sale);
    }

    /**
     * ➕ Thêm SỰ KIỆN mới
     * ✅ SỬA: Thay đổi toàn bộ validation
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'start_time' => ['required', 'date'],
            'end_time'   => ['required', 'date', 'after:start_time'],
            'is_active'  => ['boolean'],
            
            // ❌ Đã xóa 'product_id' và 'discount_percent'
        ]);
        
        // Đảm bảo is_active có giá trị
        $data['is_active'] = $request->input('is_active', false);

        // ❌ Đã xóa logic 'overlap' (vì ta chưa thêm sản phẩm)

        $sale = FlashSale::create($data);
        return response()->json(['message' => 'Tạo Sự kiện Flash Sale thành công', 'sale' => $sale], 201);
    }

    /**
     * ✏️ Cập nhật SỰ KIỆN
     * ✅ SỬA: Thay đổi toàn bộ validation
     */
    public function update(Request $request, $id)
    {
        $sale = FlashSale::findOrFail($id);
        
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'start_time' => ['required', 'date'],
            'end_time'   => ['required', 'date', 'after:start_time'],
            'is_active'  => ['boolean'],
            
            // ❌ Đã xóa 'product_id' và 'discount_percent'
        ]);
        
        $data['is_active'] = $request->input('is_active', false);

        $sale->update($data);
        return response()->json(['message' => 'Cập nhật Flash Sale thành công', 'sale' => $sale]);
    }

    /**
     * ❌ Xóa SỰ KIỆN
     * (Hàm này không đổi)
     */
    public function destroy($id)
    {
        $sale = FlashSale::findOrFail($id);
        // (Lưu ý: Bạn có thể cần xóa các sản phẩm con trong sự kiện này trước)
        $sale->delete();
        return response()->json(['message' => 'Đã xóa Flash Sale']);
    }
}