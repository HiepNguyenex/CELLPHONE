<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema; // 👈 THÊM
use App\Models\Setting;

class AdminSettingController extends Controller
{
    public function index()
    {
        if (!Schema::hasTable('settings')) {
            return response()->json([]); // bảng chưa có -> rỗng
        }
        return response()->json(Setting::pluck('value', 'key'));
    }

    public function save(Request $r)
    {
        $settings = $r->input('settings', []);
        if (is_string($settings)) {
            $settings = json_decode($settings, true) ?: [];
        }
        $r->merge($settings);

        $data = $r->validate([
            'site_name'            => 'nullable|string|max:100',
            'support_email'        => 'nullable|email',
            'hotline'              => 'nullable|string|max:20',
            'address'              => 'nullable|string|max:255',
            'shipping_fee_default' => 'nullable|numeric|min:0',
            'free_shipping_min'    => 'nullable|numeric|min:0',
            'logo'                 => 'nullable|image|mimes:png,jpg,jpeg,webp|max:2048',
        ]);

        // lưu các key thường
        foreach ($data as $k => $v) {
            if ($k === 'logo') continue;
            Setting::updateOrCreate(['key' => $k], ['value' => $v]);
        }

        // upload logo (nếu có)
        if ($r->hasFile('logo')) {
$path = $r->file('logo')->store('logos', 'public');
$url  = asset('storage/' . $path);
Setting::updateOrCreate(['key' => 'logo'], ['value' => $url]);
        }

        return response()->json(['success' => true]);
    }
}
