import axios from "axios";

// ============================ BASE CONFIG ============================
const BASE_URL = (
  import.meta?.env?.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

// ❌ Không cấu hình CSRF/XSRF khi dùng Bearer giữa Vercel ↔ Render
// axios.defaults.xsrfCookieName = "XSRF-TOKEN";
// axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

// 🔧 Helper: Chuyển object sang FormData
function toFormData(obj = {}) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    fd.append(k, v);
  });
  return fd;
}

// ✅ KHÔNG gửi cookie cross-site (Sanctum PAT không cần cookie)
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: { Accept: "application/json" },
});

// ===== Interceptors =====
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("admin_token");
  const userToken = localStorage.getItem("token");
  const token = adminToken || userToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin_token");
    }
    return Promise.reject(err);
  }
);

// ✅ Không cần Sanctum csrf-cookie nữa (để tương thích import cũ)
async function ensureSanctum() {}
export const getCsrfCookie = ensureSanctum;

// ============================ USER AUTH ==============================
export const login = async (data) => {
  // Bearer token flow
  return api.post("/v1/login", data);
};

export const register = async (data) => {
  return api.post("/v1/register", data);
};

export const getUser = (signal) => api.get("/v1/user", { signal });

export const logout = async () => {
  return api.post("/v1/logout");
};

// ============================ CATALOG (PUBLIC) ======================
export const getProducts = (params = {}, signal) =>
  api.get("/v1/products", { params, signal });

export const getProductDetail = (idOrSlug, signal) =>
  api.get(`/v1/products/${idOrSlug}`, { signal });

export const getProduct = getProductDetail;

export const getRelatedProducts = (id, signal) =>
  api.get(`/v1/products/${id}/related`, { signal });

export const getRecommendations = (params = {}, signal) =>
  api.get("/v1/products/recommend", { params, signal });

export const getProductBundles = (productId, signal) =>
  api
    .get(`/v1/products/${productId}/bundles`, { signal })
    .catch(() => api.get(`/v1/products/${productId}/related`, { signal }));

// ============================ REVIEWS ===============================
export const getReviews = (productId, params = {}, signal) =>
  api.get(`/v1/products/${productId}/reviews`, { params, signal });

export const addReview = (productId, payload, signal) =>
  api.post(`/v1/products/${productId}/reviews`, payload, { signal });

export const updateReview = (reviewId, payload) =>
  api.put(`/v1/reviews/${reviewId}`, payload);

export const deleteReview = (reviewId) =>
  api.delete(`/v1/reviews/${reviewId}`);

// ============================ STATIC / MISC =========================
export const getCategories = (signal) => api.get("/v1/categories", { signal });
export const getBanners = (signal) => api.get("/v1/banners", { signal });
export const getFaqs = (signal) => api.get("/v1/faqs", { signal });

export const getBrands = (params = {}, signal) =>
  api.get("/v1/brands", { params, signal });

export const getBrandDetail = (slug, params = {}, signal) =>
  api.get(`/v1/brands/${slug}`, { params, signal });

export const getSettings = (signal) => api.get("/v1/settings", { signal });

// ============================ CHECKOUT / ORDERS =====================
export const quoteCheckout = (payload) =>
  api.post("/v1/checkout/quote", payload);

export const createOrder = (payload) => api.post("/v1/orders", payload);

export const getOrders = (params = {}, signal) =>
  api.get("/v1/orders", { params, signal });

export const getOrderDetail = (id, signal) =>
  api.get(`/v1/orders/${id}`, { signal });

export const cancelOrder = (id) => api.post(`/v1/orders/${id}/cancel`);

// ============================ PAYMENTS ===============================
export const vnpayCreate = (orderId) =>
  api.post("/v1/payment/vnpay/create", { order_id: orderId });

export const stripeCreate = (orderId) =>
  api.post("/v1/payment/stripe/create", { order_id: orderId });

export const getPaymentResult = (orderId, signal) =>
  api.get(`/v1/payment/result/${orderId}`, { signal });

// ============================ WISHLIST ==============================
export const fetchWishlist = (signal) => api.get("/v1/wishlist", { signal });

export const addWishlist = (productId) =>
  api.post("/v1/wishlist", { product_id: Number(productId) });

export const removeWishlist = (productId) =>
  api.delete(`/v1/wishlist/${Number(productId)}`);

// ============================ UTILITIES =============================
export const mapCartToItems = (cart = []) =>
  cart.map((p) => ({ id: Number(p.id), qty: Number(p.qty ?? 1) }));

// ============================ FLASH SALES ===========================
export const getActiveFlashSales = (signal) =>
  api.get("/v1/flash-sales/active", { signal });

export const getFlashSales = getActiveFlashSales;

// ============================ PUBLIC BOXES ==========================
export const getWarrantyPlans = (params = {}, signal) =>
  api.get(`/v1/warranty/plans`, { params, signal });

export const getInstallments = (params = {}, signal) =>
  api.get(`/v1/installments`, { params, signal });

export const quoteInstallment = (payload = {}, signal) =>
  api.post(`/v1/installments/quote`, payload, { signal });

export const getInstallmentPlans = getInstallments;
export const calcInstallment = (payload = {}, signal) =>
  quoteInstallment(payload, signal);

export const storeAvailability = (params = {}, signal) =>
  api.get(`/v1/stores/availability`, { params, signal });

export const storeReserve = (payload = {}) =>
  api.post(`/v1/stores/reserve`, payload);

// ============================ ADMIN API =============================
// AUTH
export const adminLogin = async (data) => {
  return api.post("/v1/admin/login", data);
};
export const adminMe = () => api.get("/v1/admin/me");
export const adminLogout = async () => {
  return api.post("/v1/admin/logout");
};

// DASHBOARD
export const adminGetDashboard = (params = {}) =>
  api.get("/v1/admin/dashboard", { params });

// PRODUCTS
export const adminGetProducts = (params = {}) =>
  api.get("/v1/admin/products", { params });

export const adminCreateProduct = (payload = {}) =>
  api.post("/v1/admin/products", toFormData(payload));

export const adminUpdateProduct = (id, payload = {}) =>
  api.post(`/v1/admin/products/${id}`, toFormData(payload));

export const adminDeleteProduct = (id) =>
  api.delete(`/v1/admin/products/${id}`);

export const adminGetProduct = (id) => api.get(`/v1/admin/products/${id}`);

// PRODUCT IMAGES
export const adminGetProductImages = (productId) =>
  api.get(`/v1/admin/products/${productId}/images`);

export const adminUploadProductImage = (
  productId,
  fileOrUrl,
  isPrimary = false
) => {
  const fd = new FormData();
  if (fileOrUrl instanceof File) fd.append("image", fileOrUrl);
  else fd.append("url", String(fileOrUrl));
  if (isPrimary) fd.append("is_primary", "1");
  return api.post(`/v1/admin/products/${productId}/images`, fd);
};

export const adminDeleteProductImage = (imageId) =>
  api.delete(`/v1/admin/product-images/${imageId}`);

export const adminReorderProductImages = (productId, ids = []) =>
  api.post(`/v1/admin/products/${productId}/images/reorder`, { ids });

export const adminSetPrimaryImage = (imageId) =>
  api.post(`/v1/admin/product-images/${imageId}/primary`, {});

// VARIANTS
export const adminGetProductVariants = (productId, params = {}) =>
  api.get(`/v1/admin/products/${productId}/variants`, { params });

export const adminCreateProductVariant = (productId, payload = {}) =>
  api.post(`/v1/admin/products/${productId}/variants`, payload);

export const adminBulkUpsertProductVariants = (productId, variants = []) =>
  api.post(`/v1/admin/products/${productId}/variants/bulk-upsert`, { variants });

export const adminGetProductVariant = (variantId) =>
  api.get(`/v1/admin/product-variants/${variantId}`);

export const adminUpdateProductVariant = (variantId, payload = {}) =>
  api.post(`/v1/admin/product-variants/${variantId}`, payload);

export const adminDeleteProductVariant = (variantId) =>
  api.delete(`/v1/admin/product-variants/${variantId}`);

// CATEGORIES
export const adminGetCategories = (params = {}) =>
  api.get("/v1/admin/categories", { params });

export const adminCreateCategory = (payload = {}) =>
  api.post("/v1/admin/categories", toFormData(payload));

export const adminUpdateCategory = (id, payload = {}) =>
  api.post(`/v1/admin/categories/${id}`, toFormData(payload));

export const adminDeleteCategory = (id) =>
  api.delete(`/v1/admin/categories/${id}`);

// BRANDS
export const adminGetBrands = (params = {}) =>
  api.get("/v1/admin/brands", { params });

export const adminCreateBrand = (payload = {}) =>
  api.post("/v1/admin/brands", toFormData(payload));

export const adminUpdateBrand = (id, payload = {}) =>
  api.post(`/v1/admin/brands/${id}`, toFormData(payload));

export const adminDeleteBrand = (id) =>
  api.delete(`/v1/admin/brands/${id}`);

// ORDERS
export const adminGetOrders = (params = {}) =>
  api.get("/v1/admin/orders", { params });

export const adminGetOrder = (id) => api.get(`/v1/admin/orders/${id}`);

export const adminDeleteOrder = (id) => api.delete(`/v1/admin/orders/${id}`);

export const adminUpdateOrderStatus = (id, status, note) =>
  api.post(`/v1/admin/orders/${id}/status`, { status, note });

export const adminDownloadInvoice = (id) =>
  api.get(`/v1/admin/orders/${id}/invoice`, { responseType: "blob" });

// USERS
export const adminGetUsers = (params = {}) =>
  api.get("/v1/admin/users", { params });

export const adminGetUser = (id) => api.get(`/v1/admin/users/${id}`);

export const adminUpdateUser = (id, payload) =>
  api.post(`/v1/admin/users/${id}`, payload);

export const adminBanUser = (id) => api.post(`/v1/admin/users/${id}/ban`);
export const adminUnbanUser = (id) => api.post(`/v1/admin/users/${id}/unban`);
export const adminLogoutAllUser = (id) =>
  api.post(`/v1/admin/users/${id}/logout-all`);

// SETTINGS
export const adminGetSettings = () => api.get("/v1/admin/settings");

export const adminSaveSettings = (settings = {}) => {
  const fd = new FormData();
  const { logo, ...rest } = settings || {};
  fd.append("settings", JSON.stringify(rest || {}));
  if (logo instanceof File) fd.append("logo", logo);
  return api.post("/v1/admin/settings", fd);
};

// FLASH SALES
export const adminGetFlashSales = (params = {}) =>
  api.get("/v1/admin/flash-sales", { params });

export const adminCreateFlashSale = (payload = {}) =>
  api.post(`/v1/admin/flash-sales`, payload);

export const adminUpdateFlashSale = (id, payload = {}) =>
  api.post(`/v1/admin/flash-sales/${id}`, payload);

export const adminDeleteFlashSale = (id) =>
  api.delete(`/v1/admin/flash-sales/${id}`);

// REVIEWS
export const adminGetReviews = (params = {}) =>
  api.get("/v1/admin/reviews", { params });

export const adminUpdateReviewStatus = (id, status) =>
  api.post(`/v1/admin/reviews/${id}/status`, { status });

export const adminDeleteReview = (id) =>
  api.delete(`/v1/admin/reviews/${id}`);

export const adminBulkReviewStatus = (ids = [], status) =>
  api.post("/v1/admin/reviews/bulk/status", { ids, status });

export const adminBulkReviewDelete = (ids = []) =>
  api.post("/v1/admin/reviews/bulk/delete", { ids });

// COUPONS
export const adminGetCoupons = (params = {}) =>
  api.get("/v1/admin/coupons", { params });

export const adminCreateCoupon = (payload = {}) =>
  api.post("/v1/admin/coupons", payload);

export const adminGetCoupon = (id) => api.get(`/v1/admin/coupons/${id}`);

export const adminUpdateCoupon = (id, payload = {}) =>
  api.post(`/v1/admin/coupons/${id}`, payload);

export const adminDeleteCoupon = (id) =>
  api.delete(`/v1/admin/coupons/${id}`);

// BUNDLES
export const adminGetBundles = (productId) =>
  api.get(`/v1/admin/products/${productId}/bundles`);

export const adminUpsertBundles = (productId, items = []) =>
  api.post(`/v1/admin/products/${productId}/bundles/upsert`, { items });

export const adminDetachBundle = (productId, bundleProductId) =>
  api.delete(`/v1/admin/products/${productId}/bundles/${bundleProductId}`);

// STORES
export const adminGetStores = (params = {}) =>
  api.get(`/v1/admin/stores`, { params });

export const adminCreateStore = (payload = {}) =>
  api.post(`/v1/admin/stores`, payload);

export const adminUpdateStore = (id, payload = {}) =>
  api.post(`/v1/admin/stores/${id}`, payload);

export const adminDeleteStore = (id) =>
  api.delete(`/v1/admin/stores/${id}`);

// INVENTORIES
export const adminGetInventories = (params = {}) =>
  api.get(`/v1/admin/inventories`, { params });

export const adminUpsertInventories = (items = []) =>
  api.post(`/v1/admin/inventories/bulk-upsert`, { items });

export const adminDeleteInventory = (id) =>
  api.delete(`/v1/admin/inventories/${id}`);

// WARRANTY PLANS
export const adminGetWarrantyPlans = (params = {}) =>
  api.get(`/v1/admin/warranties`, { params });

export const adminCreateWarrantyPlan = (payload = {}) =>
  api.post(`/v1/admin/warranties`, payload);

export const adminUpdateWarrantyPlan = (id, payload = {}) =>
  api.post(`/v1/admin/warranties/${id}`, payload);

export const adminDeleteWarrantyPlan = (id) =>
  api.delete(`/v1/admin/warranties/${id}`);

// INSTALLMENTS
export const adminGetInstallments = (params = {}) =>
  api.get(`/v1/admin/installments`, { params });

export const adminCreateInstallment = (payload = {}) =>
  api.post(`/v1/admin/installments`, payload);

export const adminUpdateInstallment = (id, payload = {}) =>
  api.post(`/v1/admin/installments/${id}`, payload);

export const adminDeleteInstallment = (id) =>
  api.delete(`/v1/admin/installments/${id}`);

// ============================ EXPORT DEFAULT ========================
export default api;
