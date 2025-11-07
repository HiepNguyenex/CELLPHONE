<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    /**
     * GET /api/v1/products/{productId}/reviews
     */
    public function index($productId, Request $r)
    {
        $product = Product::findOrFail($productId);

        // Lấy user ID từ Sanctum (API token) hoặc Auth (session)
        $userId = optional($r->user('sanctum'))->id ?? Auth::id();

        $query = Review::with('user:id,name')
            ->where('product_id', $product->id)
            ->when($userId, function ($q) use ($userId) {
                // Nếu có user: hiển thị cả review đã duyệt + review của chính họ (kể cả pending/rejected)
                $q->where(function ($sub) use ($userId) {
                    $sub->where('status', Review::STATUS_APPROVED)
                        ->orWhere('user_id', $userId);
                });
            }, function ($q) {
                // Khách: chỉ xem review đã duyệt
                $q->where('status', Review::STATUS_APPROVED);
            })
            ->orderByDesc('created_at');

        if ($r->filled('rating')) {
            $query->where('rating', (int) $r->rating);
        }

        // per_page linh hoạt (3..20)
        $perPage = (int) $r->get('per_page', 5);
        $perPage = max(3, min($perPage, 20));

        $reviews = $query->paginate($perPage);

        // Thống kê chỉ tính review đã duyệt
        $approvedQuery = Review::where('product_id', $product->id)
            ->where('status', Review::STATUS_APPROVED);

        $breakdown = $approvedQuery
            ->selectRaw('rating, COUNT(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $stats = [
            'count'      => (int) $approvedQuery->count(),
            'avg_rating' => round((float) $approvedQuery->avg('rating'), 1),
            'breakdown'  => $breakdown,
        ];

        return response()->json([
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'has_more'     => $reviews->hasMorePages(),
                'per_page'     => $perPage,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * POST /api/v1/products/{productId}/reviews
     * 🚀 FIX: Cho phép cập nhật và TỰ ĐỘNG DUYỆT nếu đã mua hàng.
     */
    public function store(Request $request, $productId = null)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Bạn cần đăng nhập để đánh giá.'], 401);
        }

        $rules = [
            'rating'  => ['required', 'integer', Rule::in([1, 2, 3, 4, 5])],
            'content' => ['nullable', 'string', 'max:2000'],
        ];

        if ($productId === null) {
            $rules['product_id'] = ['required', 'integer', 'exists:products,id'];
        }

        $validated = $request->validate($rules);

        $productId = $productId ?? ($validated['product_id'] ?? null);
        $product   = Product::findOrFail($productId);
        
        // 1. Kiểm tra đã mua hàng chưa (Business Logic)
        $hasPurchased = OrderItem::where('product_id', $product->id)
            ->whereHas('order', fn($q) => $q->where('user_id', $userId))
            ->exists();

        if (!$hasPurchased) {
            return response()->json([
                'message' => 'Bạn chỉ có thể đánh giá sản phẩm sau khi đã mua hàng.'
            ], 403);
        }
        
        // 2. Xác định trạng thái mới (TỰ ĐỘNG DUYỆT nếu đã mua)
        $newStatus = Review::STATUS_APPROVED;
        
        // 3. Tìm đánh giá hiện tại để tránh trùng lặp
        $existingReview = Review::where('product_id', $product->id)
            ->where('user_id', $userId)
            ->first(); 

        if ($existingReview) {
            // 🚀 FIX 422: Cập nhật đánh giá cũ thay vì báo lỗi
            $existingReview->update(array_merge($validated, [
                'status' => $newStatus, 
            ]));
            
            return response()->json([
                'message' => 'Đã cập nhật đánh giá cũ thành công.',
                'data'    => $existingReview->load('user:id,name'),
            ], 200); 
        }

        // 4. Tạo review mới (TỰ ĐỘNG DUYỆT)
        $review = Review::create([
            'user_id'           => $userId,
            'product_id'        => $product->id,
            'rating'            => $validated['rating'],
            'content'           => $validated['content'] ?? null,
            'verified_purchase' => true,
            'status'            => $newStatus, // 🚀 TỰ ĐỘNG DUYỆT
        ]);

        $review->load('user:id,name');

        return response()->json([
            'message' => 'Đã gửi đánh giá thành công.',
            'data'    => $review,
        ], 201);
    }

    /**
     * PUT /api/v1/reviews/{id}
     * ✅ Người dùng sửa review của chính mình → đưa về pending
     */
    public function update($id, Request $r)
    {
        $review = Review::findOrFail($id);

        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Bạn không có quyền sửa đánh giá này.'], 403);
        }

        $validated = $r->validate([
            'rating'  => ['required', 'integer', Rule::in([1, 2, 3, 4, 5])],
            'content' => ['nullable', 'string', 'max:2000'],
        ]);

        // Giữ nguyên logic đưa về pending khi người dùng tự chỉnh sửa
        $review->update(array_merge($validated, [
            'status' => Review::STATUS_PENDING,
        ]));

        return response()->json(['message' => 'Đã cập nhật đánh giá.']);
    }

    /**
     * DELETE /api/v1/reviews/{id}
     * ✅ Người dùng xóa review của chính mình
     */
    public function destroy($id)
    {
        $review = Review::findOrFail($id);

        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Bạn không có quyền xóa đánh giá này.'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Đã xóa đánh giá.']);
    }
}