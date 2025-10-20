<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    /**
     * GET /api/v1/products/{productId}/reviews
     * ✅ Phân trang, lọc theo rating, thống kê chi tiết
     */
    public function index($productId, Request $r)
    {
        $product = Product::findOrFail($productId);

        $query = Review::with('user:id,name')
            ->where('product_id', $product->id)
            ->orderBy('created_at', 'desc');

        if ($r->filled('rating')) {
            $query->where('rating', (int)$r->rating);
        }

        $perPage = 5;
        $reviews = $query->paginate($perPage);

        $breakdown = Review::where('product_id', $product->id)
            ->selectRaw('rating, COUNT(*) as total')
            ->groupBy('rating')
            ->pluck('total', 'rating');

        $stats = [
            'count' => (int) Review::where('product_id', $product->id)->count(),
            'avg_rating' => round((float) Review::where('product_id', $product->id)->avg('rating'), 1),
            'breakdown' => $breakdown,
        ];

        return response()->json([
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'has_more' => $reviews->hasMorePages(),
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * POST /api/v1/products/{productId}/reviews (auth)
     * ✅ Tạo review hiển thị ngay
     */
    public function store($productId, Request $request)
    {
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'rating'  => ['required','integer', Rule::in([1,2,3,4,5])],
            'content' => ['nullable','string','max:2000'],
        ]);

        $exists = Review::where('product_id', $product->id)
            ->where('user_id', Auth::id())
            ->exists();
        if ($exists) {
            return response()->json(['message' => 'Bạn đã đánh giá sản phẩm này rồi.'], 422);
        }

        Review::create([
            'user_id'    => Auth::id(),
            'product_id' => $product->id,
            'rating'     => $validated['rating'],
            'content'    => $validated['content'] ?? null,
        ]);

        return response()->json(['message' => 'Đã gửi đánh giá thành công.'], 201);
    }

    /**
     * PUT /api/v1/reviews/{id}
     * ✅ Người dùng sửa review của chính mình
     */
    public function update($id, Request $r)
    {
        $review = Review::findOrFail($id);

        if ($review->user_id !== Auth::id()) {
            return response()->json(['message' => 'Bạn không có quyền sửa đánh giá này.'], 403);
        }

        $validated = $r->validate([
            'rating'  => ['required','integer', Rule::in([1,2,3,4,5])],
            'content' => ['nullable','string','max:2000'],
        ]);

        $review->update($validated);

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
