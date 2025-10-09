<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    /**
     * GET /api/v1/brands
     * Hiển thị danh sách thương hiệu đang hoạt động
     */
    public function index(Request $request)
    {
        $q = Brand::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($search = $request->get('q')) {
            $q->where('name', 'like', "%{$search}%");
        }

        return response()->json(
            $q->get(['id', 'name', 'slug', 'logo'])
        );
    }
}
