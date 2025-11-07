<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        // Các trạng thái tính doanh thu (tuỳ dự án bạn, sửa cho khớp)
        $paidStatuses = ['paid','processing','shipping','shipped','completed'];
        
        // 🚀 FIX: Lấy tên bảng chính xác để tránh lỗi Case Sensitivity trên Render
        $orderTable = (new Order())->getTable();
        $productTable = (new Product())->getTable();
        $userTable = (new User())->getTable();


        $now = now();
        // 6 tháng gần nhất (bao gồm tháng hiện tại)
        $months = collect(range(5, 0))->map(fn($i) => $now->copy()->subMonths($i)->startOfMonth());

        // Gom doanh thu theo tháng trực tiếp từ DB
        $from = $months->first()->copy()->startOfMonth();
        
        // 🚀 FIX: Dùng DB::table() cho truy vấn aggregation
        $revenueRows = DB::table($orderTable)
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as ym, SUM(total) as revenue, COUNT(*) as orders')
            ->whereIn('status', $paidStatuses)
            ->where('created_at', '>=', $from)
            ->groupBy('ym')
            ->orderBy('ym')
            ->get()
            ->keyBy('ym');

        $revenueByMonth = $months->map(function (Carbon $m) use ($revenueRows) {
            $key = $m->format('Y-m');
            $row = $revenueRows->get($key);
            return [
                'ym'      => $key,
                'label'   => $m->format('m/Y'),
                'revenue' => (float) ($row->revenue ?? 0),
                'orders'  => (int)   ($row->orders  ?? 0),
            ];
        });

        // Tổng quan
        $summary = [
            // 🚀 FIX: Sử dụng DB::table() thay cho Model::count()
            'orders'         => DB::table($orderTable)->count(),
            'products'       => DB::table($productTable)->count(),
            'users'          => DB::table($userTable)->count(),
            
            'today_revenue'  => (float) DB::table($orderTable)->whereIn('status', $paidStatuses)
                                                ->whereDate('created_at', $now->toDateString())
                                                ->sum('total'),
                                                
            'month_revenue'  => (float) DB::table($orderTable)->whereIn('status', $paidStatuses)
                                                ->whereBetween('created_at', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])
                                                ->sum('total'),
        ];

        // Đơn hàng gần đây
        $recentOrders = Order::select('id','code','name','total','status','created_at')
            ->latest('created_at')
            ->take(5)
            ->get();

        return response()->json([
            'summary'          => $summary,
            'revenue_by_month' => $revenueByMonth,
            'recent_orders'    => $recentOrders,
        ]);
    }
}