<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\FlashSale;
use App\Models\FlashSaleItem;
use App\Models\Product; 
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str; 

class AdminFlashSaleController extends Controller
{
    /**
     * ✅ Lấy danh sách SỰ KIỆN (Index)
     */
    public function index(Request $request)
    {
        $query = FlashSale::query();

        if ($request->has('status')) {
            $now = now();
            if ($request->status === 'active') {
                $query->where('start_time', '<=', $now)
                      ->where('end_time', '>=', $now)
                      ->where('is_active', true);
            } elseif ($request->status === 'upcoming') {
                $query->where('start_time', '>', $now)
                      ->where('is_active', true);
            } elseif ($request->status === 'expired') {
                $query->where('end_time', '<', $now);
            }
        }

        $sales = $query->latest('start_time')->paginate(10);
        return response()->json($sales);
    }

    /**
     * 👁️ Xem chi tiết 1 SỰ KIỆN
     */
    public function show($id)
    {
        $sale = FlashSale::findOrFail($id);
        return response()->json($sale);
    }

    /**
     * ➕ Thêm SỰ KIỆN mới
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'start_time'         => ['required', 'date'],
            'end_time'           => ['required', 'date', 'after:start_time'],
            'is_active'          => ['boolean'],
            'banner_image_url'   => ['nullable', 'url', 'max:255'],
            'description'        => ['nullable', 'string'],
        ]);
        
        $data['is_active'] = $request->input('is_active', false);

        $sale = FlashSale::create($data);
        return response()->json(['message' => 'Tạo Sự kiện Flash Sale thành công', 'sale' => $sale], 201);
    }

    /**
     * ✏️ Cập nhật SỰ KIỆN
     */
    public function update(Request $request, $id)
    {
        $sale = FlashSale::findOrFail($id);
        
        $data = $request->validate([
            'name'               => ['required', 'string', 'max:255'],
            'start_time'         => ['required', 'date'],
            'end_time'           => ['required', 'date', 'after:start_time'],
            'is_active'          => ['boolean'],
            'banner_image_url'   => ['nullable', 'url', 'max:255'],
            'description'        => ['nullable', 'string'],
        ]);
        
        $data['is_active'] = $request->input('is_active', false);

        $sale->update($data);
        return response()->json(['message' => 'Cập nhật Flash Sale thành công', 'sale' => $sale]);
    }

    /**
     * ❌ Xóa SỰ KIỆN
     */
    public function destroy($id)
    {
        $sale = FlashSale::findOrFail($id);
        $sale->delete();
        return response()->json(['message' => 'Đã xóa Flash Sale']);
    }

    // =======================================================
    // 💡 LOGIC QUẢN LÝ SẢN PHẨM FLASH SALE
    // =======================================================

    /**
     * Lấy danh sách sản phẩm để quản lý cho một Flash Sale cụ thể (bao gồm trạng thái sale)
     */
    public function getProductsForAdmin(Request $r, $id)
    {
        $flashSale = FlashSale::findOrFail($id);
        
        $q = Product::query();

        $q->leftJoin('flash_sale_items as fsi', function ($join) use ($id) {
            $join->on('fsi.product_id', '=', 'products.id')
                 ->where('fsi.flash_sale_id', '=', $id);
        });

        if ($search = trim((string) $r->get('q'))) {
            $q->where('products.name', 'like', "%{$search}%");
        }
        
        // Lấy tất cả các cột cần thiết
        $selectColumns = [
            'products.id', 
            'products.name',
            'products.price',
            'products.image_url',
            'fsi.sale_price as flash_sale_price', 
            'fsi.discount_percent',
            'fsi.id as flash_sale_item_id',
            'fsi.is_active as is_sale_active',
            'fsi.is_featured', 
        ];

        $q->select($selectColumns);

        // Sắp xếp: Ưu tiên sản phẩm nổi bật
        $q->orderBy('fsi.is_featured', 'desc')->orderByDesc('fsi.id')->orderBy('products.name');

        return response()->json(
            $q->paginate(
                (int) $r->get('per_page', 50), 
                ['products.id', ...$selectColumns]
            )
        );
    }
    
    /**
     * Thêm/Sửa/Xóa sản phẩm khỏi Flash Sale
     */
    public function upsertFlashSaleProduct(Request $r, $id)
    {
        $data = $r->validate([
            'product_id' => ['required', 'exists:products,id'],
            'sale_price' => ['nullable', 'numeric', 'min:0'],
            'discount_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'], // Validation cho Nổi bật
        ]);
        
        $flashSale = FlashSale::findOrFail($id);

        $itemId = FlashSaleItem::where('flash_sale_id', $id)
            ->where('product_id', $data['product_id'])
            ->value('id');

        // Logic Xóa/Tắt Sale
        if (isset($data['is_active']) && $data['is_active'] === false) {
             if ($itemId) {
                 FlashSaleItem::destroy($itemId);
                 return response()->json(['success' => true, 'action' => 'deleted'], 200);
             }
             return response()->json(['success' => false, 'message' => 'Item not found'], 404);
        }

        // Logic Thêm/Sửa Sale
        if (empty($data['sale_price']) && empty($data['discount_percent'])) {
            return response()->json(['message' => 'Phải cung cấp sale_price hoặc discount_percent.'], 422);
        }

        $item = FlashSaleItem::updateOrCreate(
            ['flash_sale_id' => $id, 'product_id' => $data['product_id']],
            [
                'sale_price' => $data['sale_price'],
                'discount_percent' => $data['discount_percent'],
                'is_active' => $data['is_active'] ?? true,
                'is_featured' => $data['is_featured'] ?? false,
            ]
        );

        return response()->json(['success' => true, 'data' => $item], 200);
    }
}