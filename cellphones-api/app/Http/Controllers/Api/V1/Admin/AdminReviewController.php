<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminReviewController extends Controller
{
    /**
     * GET /api/v1/admin/reviews
     * Hỗ trợ: status, q, rating, product_id, user_id, per_page
     */
    public function index(Request $r)
    {
        $perPage = (int) $r->get('per_page', 20);
        $perPage = max(5, min($perPage, 100));

        $q = Review::query()
            ->with(['user:id,name,email', 'product:id,name'])
            ->when($r->filled('status'), fn($x) => $x->where('status', $r->status))
            ->when($r->filled('rating'), fn($x) => $x->where('rating', (int)$r->rating))
            ->when($r->filled('product_id'), fn($x) => $x->where('product_id', (int)$r->product_id))
            ->when($r->filled('user_id'), fn($x) => $x->where('user_id', (int)$r->user_id))
            ->when($r->filled('q'), function ($x) use ($r) {
                $kw = trim($r->q);
                $x->where(function ($y) use ($kw) {
                    $y->where('content', 'like', "%{$kw}%")
                      ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$kw}%"));
                });
            })
            ->orderBy('created_at', 'desc');

        return response()->json($q->paginate($perPage));
    }

    /** POST /api/v1/admin/reviews/{id}/status */
    public function updateStatus($id, Request $r)
    {
        $data = $r->validate([
            'status' => ['required', Rule::in([
                Review::STATUS_PENDING,
                Review::STATUS_APPROVED,
                Review::STATUS_REJECTED
            ])],
        ]);

        $rv = Review::findOrFail($id);
        $rv->update(['status' => $data['status']]);

        return response()->json(['message' => 'Cập nhật trạng thái thành công']);
    }

    /** DELETE /api/v1/admin/reviews/{id} */
    public function destroy($id)
    {
        $rv = Review::findOrFail($id);
        $rv->delete();

        return response()->json(['message' => 'Đã xóa review']);
    }

    /** POST /api/v1/admin/reviews/bulk/status  body: { ids:[], status } */
    public function bulkStatus(Request $r)
    {
        $data = $r->validate([
            'ids'    => ['required','array'],
            'ids.*'  => ['integer'],
            'status' => ['required', Rule::in([
                Review::STATUS_PENDING,
                Review::STATUS_APPROVED,
                Review::STATUS_REJECTED
            ])],
        ]);

        Review::whereIn('id', $data['ids'])->update(['status' => $data['status']]);

        return response()->json(['message' => 'Đã cập nhật trạng thái hàng loạt']);
    }

    /** POST /api/v1/admin/reviews/bulk/delete  body: { ids:[] } */
    public function bulkDestroy(Request $r)
    {
        $data = $r->validate([
            'ids'   => ['required','array'],
            'ids.*' => ['integer'],
        ]);

        Review::whereIn('id', $data['ids'])->delete();

        return response()->json(['message' => 'Đã xóa hàng loạt']);
    }
}
