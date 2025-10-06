<?php

use Illuminate\Support\Facades\Route;

// ===== Controllers người dùng =====
use App\Http\Controllers\Api\V1\HomeController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\WishlistController;
use App\Http\Controllers\Api\V1\SettingController;             // Public Settings
use App\Http\Controllers\AuthController;

// ===== Controllers Admin =====
use App\Http\Controllers\Api\V1\Admin\AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\AdminProductController;
use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AdminSettingController;   // Admin Settings

// ===== Controllers Payment =====
use App\Http\Controllers\Api\V1\PaymentController;              // VNPay

/**
 * Alias cũ cho FE cũ (tránh 404)
 */
Route::post('/login',    [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::prefix('v1')->group(function () {

    // ========================== PUBLIC ==========================
    Route::get('/ping', fn () => response('pong', 200));
    Route::get('/home', [HomeController::class, 'index']);

    // Products
    Route::get('/products',      [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    // Categories & Banners
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/banners',    [BannerController::class, 'index']);

    // FAQs
    Route::get('/faqs', [FaqController::class, 'index']);

    // Public Settings
    Route::get('/settings', [SettingController::class, 'index']);

    // Auth (user)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);

    // ========================== ADMIN AUTH (Public login) ==========================
    Route::post('/admin/login', [AdminAuthController::class, 'login']);

    // ========================== VNPay CALLBACKS (PUBLIC) ==========================
    Route::match(['get','post'], '/payment/vnpay/return', [PaymentController::class, 'vnpayReturn']);
    Route::match(['get','post'], '/payment/vnpay/ipn',    [PaymentController::class, 'vnpayIpn']);

    // ========================== USER PROTECTED ==========================
    Route::middleware('auth:sanctum')->group(function () {
        // Profile
        Route::get('/user',    [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);

        // Orders
        Route::post('/checkout/quote',     [OrderController::class, 'quote']);
        Route::post('/orders',             [OrderController::class, 'store']);
        Route::get ('/orders',             [OrderController::class, 'index']);
        Route::get ('/orders/{id}',        [OrderController::class, 'show']);
        Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

        // Wishlist
        Route::get   ('/wishlist',             [WishlistController::class, 'index']);
        Route::post  ('/wishlist',             [WishlistController::class, 'store']);
        Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);

        // Payments (VNPay)
        Route::post('/payment/vnpay/create', [PaymentController::class, 'vnpayCreate']); // tạo URL thanh toán
    });

    // ========================== ADMIN PROTECTED ==========================
    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
        // Profile
        Route::get ('/me',     [AdminAuthController::class, 'me']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);

        // Dashboard
        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        // Products CRUD
        Route::get   ('/products',       [AdminProductController::class, 'index']);
        Route::post  ('/products',       [AdminProductController::class, 'store']);
        Route::get   ('/products/{id}',  [AdminProductController::class, 'show']);
        Route::post  ('/products/{id}',  [AdminProductController::class, 'update']);
        Route::delete('/products/{id}',  [AdminProductController::class, 'destroy']);

        // Categories CRUD
        Route::get   ('/categories',       [AdminCategoryController::class, 'index']);
        Route::post  ('/categories',       [AdminCategoryController::class, 'store']);
        Route::get   ('/categories/{id}',  [AdminCategoryController::class, 'show']);
        Route::post  ('/categories/{id}',  [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}',  [AdminCategoryController::class, 'destroy']);

        // Orders CRUD
        Route::get   ('/orders',              [AdminOrderController::class, 'index']);
        Route::get   ('/orders/{id}',         [AdminOrderController::class, 'show']);
        Route::post  ('/orders/{id}/status',  [AdminOrderController::class, 'updateStatus']);
        Route::get   ('/orders/{id}/history', [AdminOrderController::class, 'history']);
        Route::delete('/orders/{id}',         [AdminOrderController::class, 'destroy']);
        Route::get   ('/orders/{id}/invoice', [AdminOrderController::class, 'invoice']); // PDF

        // Settings
        Route::get ('/settings', [AdminSettingController::class, 'index']);
        Route::post('/settings', [AdminSettingController::class, 'save']);
    });
});
