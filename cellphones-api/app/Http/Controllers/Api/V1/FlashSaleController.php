<?php
// File: app/Http/Controllers/Api/V1/FlashSaleController.php (FINAL FIX)

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Http\Request;

class FlashSaleController extends Controller
{
    /**
     * Lấy 1 Flash Sale đang hoạt động (cho Trang chủ)
     * GET /api/v1/flash-sales/active
     */
    public function active()
    {
        $now = now();

        $flashSale = FlashSale::where('is_active', true) 
            ->where('start_time', '<=', $now)
            ->where('end_time', '>=', $now)
            ->orderBy('start_time', 'asc')
            ->first(); 

        if (!$flashSale) {
            return response()->json(['data' => null]);
        }
        
        // 2. Load quan hệ FlashSaleItems, ưu tiên is_featured
        $flashSale->load([
            'products' => function ($query) {
                // 🚀 FIX 1: Bổ sung TẤT CẢ các cột pivot cần thiết vào withPivot (id, is_active, is_featured)
                $query->withPivot(['id', 'sale_price', 'discount_percent', 'is_featured', 'is_active']) 
                      
                      // 🚀 FIX 2: Sắp xếp và lọc sử dụng orderByPivot và wherePivot để tránh lỗi SQL
                      ->wherePivot('is_active', true) // Chỉ lấy sản phẩm đang hoạt động (trên bảng pivot)
                      ->orderByPivot('is_featured', 'desc') // Ưu tiên sản phẩm Nổi bật
                      ->orderByPivot('id', 'asc') // Sau đó sắp xếp theo ID khi nổi bật bằng nhau
                      
                      ->limit(3) 
                      ->select(['products.id', 'products.name', 'products.slug', 'products.price', 'products.image_url']); 
            },
        ]);

        // 3. Chuẩn hóa dữ liệu trả về
        $productsData = $flashSale->products->map(function ($product) {
            $originalPrice = $product->price;
            $pivot = $product->pivot;
            
            $flashSalePrice = $pivot->sale_price;
            if ($flashSalePrice === null && $pivot->discount_percent > 0) {
                 $flashSalePrice = $originalPrice * (1 - $pivot->discount_percent / 100);
            }
            
            $discountPercent = $pivot->discount_percent;
            if ($flashSalePrice !== null && $originalPrice > 0) {
                $discountPercent = round((($originalPrice - $flashSalePrice) / $originalPrice) * 100);
            }

            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'image_url' => $product->image_url,
                'original_price' => (float) $originalPrice,
                'flash_sale_price' => (float) $flashSalePrice,
                'discount_percent' => $discountPercent,
                'is_featured' => $product->pivot->is_featured ?? false, // Trả về trạng thái nổi bật
            ];
        });

        return response()->json([
            'id' => $flashSale->id,
            'name' => $flashSale->name,
            'banner_image_url' => $flashSale->banner_image_url,
            'description' => $flashSale->description,
            'start_time' => $flashSale->start_time,
            'end_time' => $flashSale->end_time,
            'products' => $productsData,
        ]);
    }
}