<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use Illuminate\Http\Request;

class FlashSaleController extends Controller
{
    /**
     * Lấy danh sách flash sale đang hoạt động
     * GET /api/v1/flash-sales/active
     */
    public function active()
    {
        $now = now();

        $sales = FlashSale::with(['product:id,name,slug,price,sale_price,image_url,stock'])
            ->where('is_active', true)
            ->where('start_time', '<=', $now)
            ->where('end_time', '>=', $now)
            ->orderBy('start_time', 'asc')
            ->take(10)
            ->get();

        return response()->json($sales);
    }
}
