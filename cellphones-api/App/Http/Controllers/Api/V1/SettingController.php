<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Support\Facades\Schema; // 👈 THÊM

class SettingController extends Controller
{
    public function index()
    {
        if (!Schema::hasTable('settings')) {
            return response()->json([]); // bảng chưa có -> trả rỗng
        }
        return response()->json(Setting::pluck('value', 'key'));
    }
}
