<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(
            Category::withCount('products')
                ->orderBy('name')
                ->get(['id','name'])
        );
    }
}
