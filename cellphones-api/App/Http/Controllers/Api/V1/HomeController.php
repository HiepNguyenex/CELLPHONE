<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\{Banner, Category, Product};


class HomeController extends Controller
{
public function index()
{
$heroBanners = Banner::where(['position'=>'home_hero','is_active'=>true])->orderByDesc('id')->take(5)->get();
$topCategories = Category::withCount('products')->orderByDesc('products_count')->take(8)->get();
$featuredProducts = Product::with(['brand','category'])->where('is_featured', true)->latest()->take(12)->get();
return response()->json(compact('heroBanners','topCategories','featuredProducts'));
}
}