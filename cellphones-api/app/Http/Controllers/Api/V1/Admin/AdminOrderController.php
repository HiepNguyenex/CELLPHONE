<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Events\OrderStatusChanged;

class AdminOrderController extends Controller
{
    /**
     * GET /api/v1/admin/orders?q=&status=&per_page=
     */
    public function index(Request $request)
    {
        $q = Order::query()
            ->select('id', 'code', 'name', 'email', 'total', 'status', 'created_at')
            ->orderByDesc('id');

        if ($kw = trim((string) $request->get('q', ''))) {
            $q->where(function ($x) use ($kw) {
                $x->where('code', 'like', "%{$kw}%")
                  ->orWhere('name', 'like', "%{$kw}%")
                  ->orWhere('email', 'like', "%{$kw}%");
            });
        }

        if ($request->filled('status')) {
            $q->where('status', $request->get('status'));
        }

        $per = max(10, min((int) $request->get('per_page', 20), 100));
        return response()->json($q->paginate($per));
    }

    /**
     * GET /api/v1/admin/orders/{id}
     */
    public function show($id)
    {
        $order = Order::with([
            'items:id,order_id,product_id,name,price,qty,image_url',
            'histories.admin:id,name',
        ])->findOrFail($id);

        return response()->json($order);
    }

    /**
     * POST /api/v1/admin/orders/{id}/status
     * ✅ Cập nhật trạng thái + hoàn kho (nếu huỷ/refund) + ghi lịch sử + event
     */
    public function updateStatus(Request $r, $id)
    {
        $data = $r->validate([
            'status' => [
                'required',
                Rule::in(['pending','paid','processing','shipping','shipped','completed','canceled','refunded']),
            ],
            'note'   => ['nullable','string','max:1000'],
        ]);

        $order = Order::findOrFail($id);
        $from  = $order->status;
        $to    = $data['status'];

        // Ràng buộc luồng hợp lệ
        $map = [
            'pending'    => ['paid','processing','canceled'],
            'paid'       => ['processing','canceled','refunded'],
            'processing' => ['shipping','canceled','refunded'],
            'shipping'   => ['shipped','canceled','refunded'],
            'shipped'    => ['completed','refunded'],
            'completed'  => [],
            'canceled'   => [],
            'refunded'   => [],
        ];

        if (!in_array($to, $map[$from] ?? [])) {
            return response()->json([
                'success' => false,
                'message' => "Không thể chuyển từ [$from] sang [$to]."
            ], 422);
        }

        DB::transaction(function () use ($order, $r, $from, $to, $data) {
            // ✅ Cập nhật trạng thái đơn
            $order->status = $to;
            $order->save();

            // ✅ Hoàn kho nếu huỷ/refunded
            if (!in_array($from, ['canceled','refunded']) && in_array($to, ['canceled','refunded'])) {
                $order->loadMissing('items');
                foreach ($order->items as $it) {
                    Product::whereKey($it->product_id)->increment('stock', $it->qty);
                }
            }

            // ✅ Ghi lịch sử thay đổi trạng thái
            OrderStatusHistory::create([
                'order_id'    => $order->id,
                'admin_id'    => $r->user()->id ?? null,
                'from_status' => $from,
                'to_status'   => $to,
                'note'        => $data['note'] ?? null,
            ]);

            // ✅ Gửi event cho listener/email
            OrderStatusChanged::dispatch($order, $from, $to, $data['note'] ?? null);
        });

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công',
        ]);
    }

    /**
     * GET /api/v1/admin/orders/{id}/history
     */
    public function history($id)
    {
        $order = Order::findOrFail($id);
        $histories = $order->histories()->with('admin:id,name')->get();

        return response()->json($histories);
    }

    /**
     * DELETE /api/v1/admin/orders/{id}
     * ✅ Xoá an toàn: chỉ xoá pending / canceled
     */
    public function destroy($id)
    {
        $order = Order::with(['items', 'histories'])->findOrFail($id);

        if (!in_array($order->status, ['pending', 'canceled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ được xoá đơn ở trạng thái pending hoặc canceled.',
            ], 422);
        }

        DB::transaction(function () use ($order) {
            $order->items()->delete();
            $order->histories()->delete();
            $order->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Đã xoá đơn hàng.',
        ]);
    }

    /**
     * GET /api/v1/admin/orders/{id}/invoice
     * ✅ Xuất PDF hóa đơn
     */
    public function invoice($id)
    {
        $order = Order::with(['items.product'])->findOrFail($id);
        $pdf = Pdf::loadView('pdf.invoice', ['order' => $order])->setPaper('a4');
        $filename = 'invoice-' . ($order->code ?? $order->id) . '.pdf';
        return $pdf->download($filename);
    }
}
