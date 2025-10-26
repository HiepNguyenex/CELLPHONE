<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;


class BannerController extends Controller
{
public function index(Request $req)
{
$q = Banner::query();
if ($pos = $req->get('position')) $q->where('position', $pos);
if ($req->has('active')) $q->where('is_active', $req->boolean('active'));
return response()->json($q->orderByDesc('id')->get());
}
}