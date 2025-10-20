<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class StoreController extends Controller
{
    // GET /api/v1/stores/availability?product_id=1&city=DN
    public function availability(Request $request)
    {
        $request->validate([
            'product_id' => ['required','integer','exists:products,id'],
            'city'       => ['nullable','string','max:50'],
        ]);

        $productId = (int) $request->query('product_id');
        $city      = $request->query('city');

        // Tự nhận diện tên bảng tồn kho + cột "giao nhanh"
        $invTable = Schema::hasTable('store_inventories')
            ? 'store_inventories'
            : (Schema::hasTable('inventories') ? 'inventories' : null);

        if (!$invTable) {
            return response()->json([
                'product_id' => $productId,
                'city'       => $city,
                'stores'     => [],
            ]);
        }

        $fastCol = Schema::hasColumn($invTable, 'fast_2h')
            ? 'fast_2h'
            : (Schema::hasColumn($invTable, 'fast_delivery') ? 'fast_delivery' : null);

        // LEFT JOIN để lấy cả cửa hàng không có tồn kho (stock = 0)
        $q = DB::table('stores as s')
            ->leftJoin("$invTable as i", function ($j) use ($productId) {
                $j->on('i.store_id','s.id')
                  ->where('i.product_id', $productId);
            })
            ->selectRaw('s.id, s.name, s.city, s.address,
                         COALESCE(i.stock,0) as stock' . ($fastCol ? ", COALESCE(i.$fastCol,0) as fast_2h" : ''));

        if ($city) {
            $q->where('s.city', $city);
        }

        // Sắp xếp: còn hàng trước, nhiều hàng trước, rồi theo tên
        $q->orderByDesc(DB::raw('COALESCE(i.stock,0) > 0'))
          ->orderByDesc('stock')
          ->orderBy('s.name');

        $rows = $q->get()->map(function ($r) use ($fastCol) {
            return [
                'id'      => (int) $r->id,
                'name'    => (string) $r->name,
                'city'    => (string) $r->city,
                'address' => (string) ($r->address ?? ''),
                'stock'   => (int) ($r->stock ?? 0),
                'fast_2h' => $fastCol ? (bool) $r->fast_2h : false,
            ];
        });

        return response()->json([
            'product_id' => $productId,
            'city'       => $city,
            'stores'     => $rows,
        ]);
    }

    // POST /api/v1/stores/reserve (giữ máy)
    public function reserve(Request $request)
    {
        $data = $request->validate([
            'product_id' => ['required','integer','exists:products,id'],
            'store_id'   => ['required','integer','exists:stores,id'],
            'name'       => ['required','string','max:255'],
            'phone'      => ['required','string','max:50'],
        ]);

        // tuỳ bạn lưu DB / gửi mail… Ở đây mock OK
        return response()->json(['status' => true]);
    }
}
