<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Faq;

class FaqController extends Controller
{
    // GET /api/v1/faqs (public)
    public function index()
    {
        $faqs = Faq::where('is_active', true)
            ->orderBy('sort_order')->orderBy('id')
            ->get(['id','question','answer']);

        return response()->json(['data' => $faqs]);
    }
}
