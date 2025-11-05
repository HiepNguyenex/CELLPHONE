<?php
// === FILE: routes/api.php ===

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Artisan; // ✅ ĐÃ DI CHUYỂN LÊN ĐẦU ĐỂ SỬA LỖI

// ===== Controllers người dùng =====
use App\Http\Controllers\Api\V1\HomeController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\WishlistController;
use App\Http\Controllers\Api\V1\SettingController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\V1\BrandController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\FlashSaleController;
use App\Http\Controllers\Api\V1\StripeWebhookController;

// ===== Controllers PUBLIC mở rộng =====
use App\Http\Controllers\Api\V1\InstallmentController;
use App\Http\Controllers\Api\V1\StoreController;
use App\Http\Controllers\Api\V1\WarrantyController;
use App\Http\Controllers\Api\V1\ProductBundleController;

// ✅ THÊM: News Controller
use App\Http\Controllers\Api\V1\NewsController;

// === BỔ SUNG: CHATBOT CONTROLLER ===
use App\Http\Controllers\Api\V1\ChatbotController;
// ===================================

// ===== Controllers ADMIN =====
use App\Http\Controllers\Api\V1\Admin\AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\AdminProductController;
use App\Http\Controllers\Api\V1\Admin\AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AdminSettingController;
use App\Http\Controllers\Api\V1\Admin\AdminBrandController;
use App\Http\Controllers\Api\V1\Admin\AdminFlashSaleController;
use App\Http\Controllers\Api\V1\Admin\AdminReviewController;
use App\Http\Controllers\Api\V1\Admin\AdminCouponController;
use App\Http\Controllers\Api\V1\Admin\AdminProductImageController;
use App\Http\Controllers\Api\V1\Admin\AdminProductVariantController;
use App\Http\Controllers\Api\V1\Admin\AdminStoreController;
use App\Http\Controllers\Api\V1\Admin\AdminInventoryController;
use App\Http\Controllers\Api\V1\Admin\AdminWarrantyController;
use App\Http\Controllers\Api\V1\Admin\AdminInstallmentController;
use App\Http\Controllers\Api\V1\Admin\AdminProductBundleController;

// ===== Payment Controller =====
use App\Http\Controllers\Api\V1\PaymentController;

/**
 * Alias cho FE cũ (tránh 404 khi FE gọi /api/login|register)
 */
Route::post('/login',    [AuthController::class, 'apiLogin']);
Route::post('/register', [AuthController::class, 'register']);

Route::prefix('v1')->group(function () {

    // ========== PUBLIC ==========
    Route::get('/ping', fn() => response('pong', 200));
    Route::get('/home', [HomeController::class, 'index']);

    // === BỔ SUNG: CHATBOT ROUTES ===
    Route::post('/chat/start', [ChatbotController::class, 'startSession']);
    Route::post('/chat/{sessionId}/message', [ChatbotController::class, 'sendMessage']);
    Route::get('/chat/{sessionId}', [ChatbotController::class, 'getHistory']);
    // ===================================

    // PRODUCTS
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/recommend', [ProductController::class, 'recommend']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/products/{id}/related', [ProductController::class, 'related']);
    Route::get('/products/{id}/bundles', [ProductBundleController::class, 'index']);

    // REVIEWS (public GET)
    Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);

    // FLASH SALES
    Route::get('/flash-sales/active', [FlashSaleController::class, 'active']);
    Route::get('/flash-sales', [FlashSaleController::class, 'index']);

    // CATEGORIES
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    // BRANDS
    Route::get('/brands', [BrandController::class, 'index']);
    Route::get('/brands/{slug}', [BrandController::class, 'show']);

    // BANNERS, FAQ & SETTINGS
    Route::get('/banners', [BannerController::class, 'index']);
    Route::get('/faqs', [FaqController::class, 'index']);
    Route::get('/settings', [SettingController::class, 'index']);

    // ✅ THÊM: NEWS PUBLIC (FE dùng)
    Route::get('/news', [NewsController::class, 'index']);
    Route::get('/news/{slug}', [NewsController::class, 'show']);

    // AUTH (USER) – Bearer
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'apiLogin']);

    // STRIPE (PUBLIC)
    Route::prefix('payment/stripe')->group(function () {
        Route::post('/create', [PaymentController::class, 'stripeCreate']);
    });
    Route::get('/payment/result/{id}', [PaymentController::class, 'result']);
    Route::post('/payment/stripe/webhook', [StripeWebhookController::class, 'handle']);

    // PUBLIC APIs
    Route::get('/installments',        [InstallmentController::class, 'index']);
    Route::post('/installments/quote', [InstallmentController::class, 'quote']);
    Route::get('/installments/plans',  [InstallmentController::class, 'index']);
    Route::get('/installments/calc',   [InstallmentController::class, 'calcAlias']);
    Route::post('/installments/apply', [InstallmentController::class, 'applyAlias']);

    Route::get('/stores/availability', [StoreController::class, 'availability']);
    Route::post('/stores/reserve',     [StoreController::class, 'reserve']);

    Route::get('/warranty/plans',      [WarrantyController::class, 'plans']);

    // ========== USER PROTECTED ==========
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user',   [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'apiLogout']);

        // Reviews (auth)
        Route::get('/reviews/eligibility', [ReviewController::class, 'eligibility']); // ✅ mới
        Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);
        Route::post('/reviews',               [ReviewController::class, 'store']);   // tùy chọn: nhận product_id
        Route::put('/reviews/{id}',           [ReviewController::class, 'update']);
        Route::delete('/reviews/{id}',        [ReviewController::class, 'destroy']);

        // ✅ THÊM: NEWS SECURE (n8n POST)
        Route::post('/news', [NewsController::class, 'store']);

        Route::post('/checkout/quote', [OrderController::class, 'quote']);
        Route::post('/orders',         [OrderController::class, 'store']);
        Route::get('/orders',          [OrderController::class, 'index']);
        Route::get('/orders/{id}',     [OrderController::class, 'show']);
        Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

        Route::get('/wishlist',            [WishlistController::class, 'index']);
        Route::post('/wishlist',           [WishlistController::class, 'store']);
        Route::delete('/wishlist/{productId}', [WishlistController::class, 'destroy']);
    });

    // ========== ADMIN ==========
    Route::post('/admin/login', [AdminAuthController::class, 'login']);

    Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::get('/me',    [AdminAuthController::class, 'me']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);

        Route::get('/dashboard', [AdminDashboardController::class, 'index']);

        Route::get('/products',     [AdminProductController::class, 'index']);
        Route::post('/products',    [AdminProductController::class, 'store']);
        Route::get('/products/{id}',  [AdminProductController::class, 'show']);
        Route::post('/products/{id}', [AdminProductController::class, 'update']);
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy']);

        Route::get('/products/{productId}/images',       [AdminProductImageController::class, 'index']);
        Route::post('/products/{productId}/images',      [AdminProductImageController::class, 'store']);
        Route::post('/products/{productId}/images/reorder', [AdminProductImageController::class, 'reorder']);
        Route::post('/product-images/{imageId}/primary', [AdminProductImageController::class, 'setPrimary']);
        Route::delete('/product-images/{imageId}',       [AdminProductImageController::class, 'destroy']);

        Route::get('/products/{productId}/variants',            [AdminProductVariantController::class, 'index']);
        Route::post('/products/{productId}/variants',           [AdminProductVariantController::class, 'store']);
        Route::post('/products/{productId}/variants/bulk-upsert', [AdminProductVariantController::class, 'bulkUpsert']);
        Route::get('/product-variants/{variantId}',         [AdminProductVariantController::class, 'show']);
        Route::post('/product-variants/{variantId}',        [AdminProductVariantController::class, 'update']);
        Route::delete('/product-variants/{variantId}',      [AdminProductVariantController::class, 'destroy']);

        Route::get('/categories',      [AdminCategoryController::class, 'index']);
        Route::post('/categories',     [AdminCategoryController::class, 'store']);
        Route::get('/categories/{id}',   [AdminCategoryController::class, 'show']);
        Route::post('/categories/{id}',  [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);

        Route::get('/brands',      [AdminBrandController::class, 'index']);
        Route::post('/brands',     [AdminBrandController::class, 'store']);
        Route::get('/brands/{id}',   [AdminBrandController::class, 'show']);
        Route::post('/brands/{id}',  [AdminBrandController::class, 'update']);
        Route::delete('/brands/{id}', [AdminBrandController::class, 'destroy']);

        Route::get('/orders',           [AdminOrderController::class, 'index']);
        Route::get('/orders/{id}',        [AdminOrderController::class, 'show']);
        Route::post('/orders/{id}/status',  [AdminOrderController::class, 'updateStatus']);
        Route::get('/orders/{id}/history',  [AdminOrderController::class, 'history']);
        Route::delete('/orders/{id}',     [AdminOrderController::class, 'destroy']);
        Route::get('/orders/{id}/invoice',  [AdminOrderController::class, 'invoice']);

        Route::get('/users',          [AdminUserController::class, 'index']);
        Route::get('/users/{id}',       [AdminUserController::class, 'show']);
        Route::post('/users/{id}',      [AdminUserController::class, 'update']);
        Route::post('/users/{id}/ban',    [AdminUserController::class, 'ban']);
        Route::post('/users/{id}/unban',  [AdminUserController::class, 'unban']);
        Route::post('/users/{id}/logout-all', [AdminUserController::class, 'logoutAll']);

        Route::get('/settings', [AdminSettingController::class, 'index']);
        Route::post('/settings', [AdminSettingController::class, 'save']);

        Route::get('/flash-sales',      [AdminFlashSaleController::class, 'index']);
        Route::post('/flash-sales',     [AdminFlashSaleController::class, 'store']);
        Route::get('/flash-sales/{id}',   [AdminFlashSaleController::class, 'show']);
        Route::post('/flash-sales/{id}',  [AdminFlashSaleController::class, 'update']);
        Route::delete('/flash-sales/{id}', [AdminFlashSaleController::class, 'destroy']);

        // ====== Reviews (ADMIN)
        Route::get('/reviews',              [AdminReviewController::class, 'index']);
        Route::post('/reviews/{id}/status',   [AdminReviewController::class, 'updateStatus']);
        Route::delete('/reviews/{id}',        [AdminReviewController::class, 'destroy']);
        Route::post('/reviews/bulk/status',   [AdminReviewController::class, 'bulkStatus']);
        Route::post('/reviews/bulk/delete',   [AdminReviewController::class, 'bulkDestroy']);

        Route::get('/coupons',      [AdminCouponController::class, 'index']);
        Route::post('/coupons',     [AdminCouponController::class, 'store']);
        Route::get('/coupons/{id}',   [AdminCouponController::class, 'show']);
        Route::post('/coupons/{id}',  [AdminCouponController::class, 'update']);
        Route::delete('/coupons/{id}', [AdminCouponController::class, 'destroy']);

        Route::get('/stores',      [AdminStoreController::class, 'index']);
        Route::post('/stores',     [AdminStoreController::class, 'store']);
        Route::get('/stores/{id}',   [AdminStoreController::class, 'show']);
        Route::post('/stores/{id}',  [AdminStoreController::class, 'update']);
        Route::delete('/stores/{id}', [AdminStoreController::class, 'destroy']);

        Route::get('/inventories',          [AdminInventoryController::class, 'index']);
        Route::post('/inventories/bulk-upsert', [AdminInventoryController::class, 'bulkUpsert']);
        Route::delete('/inventories/{id}',  [AdminInventoryController::class, 'destroy']);

        Route::get('/warranties',      [AdminWarrantyController::class, 'index']);
        Route::post('/warranties',     [AdminWarrantyController::class, 'store']);
        Route::get('/warranties/{id}',   [AdminWarrantyController::class, 'show']);
        Route::post('/warranties/{id}',  [AdminWarrantyController::class, 'update']);
        Route::delete('/warranties/{id}', [AdminWarrantyController::class, 'destroy']);

        Route::get('/installments',      [AdminInstallmentController::class, 'index']);
        Route::post('/installments',     [AdminInstallmentController::class, 'store']);
        Route::get('/installments/{id}',   [AdminInstallmentController::class, 'show']);
        Route::post('/installments/{id}',  [AdminInstallmentController::class, 'update']);
        Route::delete('/installments/{id}', [AdminInstallmentController::class, 'destroy']);

        Route::get('/products/{productId}/bundles',       [AdminProductBundleController::class, 'index']);
        Route::post('/products/{productId}/bundles/upsert', [AdminProductBundleController::class, 'upsert']);
        Route::delete('/products/{productId}/bundles/{bundleProductId}', [AdminProductBundleController::class, 'detach']);
    });
});

// ============================================
// 🔧 TEMP: Clear cache for Render Free tier
// ============================================
// DÒNG 'use' ĐÃ ĐƯỢC CHUYỂN LÊN ĐẦU FILE
// ============================================

Route::get('/__clear-cache', function () {
    try {
        Artisan::call('config:clear');
        Artisan::call('cache:clear');
        Artisan::call('route:clear');

        if (is_dir(storage_path('framework/views'))) {
            @Artisan::call('view:clear');
        }

        return response()->json([
            'ok' => true,
            'message' => '✅ Cache cleared successfully (Render safe mode).'
        ]);
    } catch (\Throwable $th) {
        return response()->json([
            'ok' => false,
            'error' => $th->getMessage(),
        ], 500);
    }
});