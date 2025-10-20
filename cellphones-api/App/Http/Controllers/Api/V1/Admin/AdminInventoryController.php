<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminInventoryController extends Controller
{
    /** Chọn bảng tồn kho đang có: store_inventories (ưu tiên) hoặc inventories */
    protected function invTable(): string
    {
        if (Schema::hasTable('store_inventories')) return 'store_inventories';
        return 'inventories';
    }

    /** GET /v1/admin/inventories?store_id=&q=&per_page= */
    public function index(Request $request)
    {
        $tbl = $this->invTable();

        $q = DB::table($tbl . ' as i')
            ->join('products as p', 'p.id', '=', 'i.product_id')
            ->join('stores as s', 's.id', '=', 'i.store_id')
            ->select([
                'i.id', 'i.store_id', 'i.product_id', 'i.stock',
                'p.name as product_name',
                's.name as store_name', 's.city',
            ]);

        if ($request->filled('store_id')) {
            $q->where('i.store_id', (int) $request->query('store_id'));
        }

        if ($kw = trim((string) $request->query('q', ''))) {
            $q->where(function ($x) use ($kw) {
                $x->where('p.name', 'like', "%{$kw}%")
                  ->orWhere('p.id', $kw)
                  ->orWhere('i.product_id', $kw);
            });
        }

        $q->orderBy('s.name')->orderBy('p.name');

        $per = (int) $request->query('per_page', 50);
        $per = max(10, min($per, 100));

        // Trả về paginator chuẩn của Laravel: { data: [...], links, meta }
        return response()->json($q->paginate($per));
    }

    /** POST /v1/admin/inventories/bulk-upsert  { items: [{id?, store_id, product_id, stock}, ...] } */
    public function bulkUpsert(Request $request)
    {
        $data = $request->validate([
            'items'                   => ['required','array','min:1'],
            'items.*.store_id'        => ['required','integer','exists:stores,id'],
            'items.*.product_id'      => ['required','integer','exists:products,id'],
            'items.*.stock'           => ['required','integer','min:0'],
            'items.*.id'              => ['nullable','integer'],
        ]);

        $tbl = $this->invTable();
        $now = now();

        DB::transaction(function () use ($data, $tbl, $now) {
            // Nếu bảng có unique(store_id, product_id) thì dùng upsert,
            // nếu không có unique thì fallback updateOrInsert từng dòng.
            $hasUnique = false;
            try {
                DB::table($tbl)->upsert(
                    collect($data['items'])->map(function ($r) use ($now) {
                        return [
                            // upsert không cần id, khoá là (store_id, product_id)
                            'store_id'   => (int) $r['store_id'],
                            'product_id' => (int) $r['product_id'],
                            'stock'      => (int) $r['stock'],
                            'updated_at' => $now,
                            'created_at' => $now,
                        ];
                    })->all(),
                    ['store_id', 'product_id'],
                    ['stock', 'updated_at']
                );
                $hasUnique = true;
            } catch (\Throwable $e) {
                // bỏ qua, sẽ fallback bên dưới
            }

            if (! $hasUnique) {
                foreach ($data['items'] as $r) {
                    DB::table($tbl)->updateOrInsert(
                        [
                            'store_id'   => (int) $r['store_id'],
                            'product_id' => (int) $r['product_id'],
                        ],
                        [
                            'stock'      => (int) $r['stock'],
                            'updated_at' => $now,
                            'created_at' => $now,
                        ]
                    );
                }
            }
        });

        return response()->json(['status' => true]);
    }

    /** DELETE /v1/admin/inventories/{id} */
    public function destroy($id)
    {
        $tbl = $this->invTable();
        DB::table($tbl)->where('id', (int) $id)->delete();
        return response()->json(['status' => true]);
    }
}
