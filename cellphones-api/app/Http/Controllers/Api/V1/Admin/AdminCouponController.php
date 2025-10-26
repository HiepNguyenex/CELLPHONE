<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    public function index(Request $r)
    {
        $q = Coupon::query();

        if ($search = trim((string) $r->get('q'))) {
            $q->where('code', 'like', '%' . strtoupper($search) . '%');
        }

        // đổi active -> status
        if ($status = $r->get('status')) {
            if (in_array($status, ['active','inactive'], true)) {
                $q->where('status', $status);
            }
        }

        $q->orderByDesc('updated_at')->orderByDesc('id');

        return response()->json(
            $q->paginate((int) $r->get('per_page', 20))
        );
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'code'             => ['required','string','max:50','unique:coupons,code'],
            'discount'         => ['required','numeric','min:0','max:100'], // %
            'max_uses'         => ['nullable','integer','min:0'],
            'starts_at'        => ['nullable','date'],
            'expires_at'       => ['nullable','date','after_or_equal:starts_at'],
            'status'           => ['required','in:active,inactive'],
            'min_order_amount' => ['nullable','numeric','min:0'],
        ]);

        $data['code'] = strtoupper($data['code']);
        $data['used'] = 0;

        $coupon = Coupon::create($data);

        return response()->json($coupon, 201);
    }

    public function show($id)
    {
        return response()->json(Coupon::findOrFail($id));
    }

    public function update(Request $r, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $data = $r->validate([
            'code'             => ['sometimes','required','string','max:50','unique:coupons,code,'.$coupon->id],
            'discount'         => ['sometimes','required','numeric','min:0','max:100'],
            'max_uses'         => ['nullable','integer','min:0'],
            'starts_at'        => ['nullable','date'],
            'expires_at'       => ['nullable','date','after_or_equal:starts_at'],
            'status'           => ['sometimes','required','in:active,inactive'],
            'min_order_amount' => ['nullable','numeric','min:0'],
            'used'             => ['nullable','integer','min:0'],
        ]);

        if (isset($data['code'])) $data['code'] = strtoupper($data['code']);

        $coupon->update($data);

        return response()->json($coupon);
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json(['success' => true]);
    }
}
