import axios from "axios";

// ===== BASE URL =====
const BASE_URL = (
  import.meta?.env?.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

// ===== AXIOS INSTANCE =====
const api = axios.create({
  baseURL: BASE_URL,
  headers: { Accept: "application/json" },
});

// ===== TOKEN INTERCEPTOR =====
// Ưu tiên token admin → fallback user
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("admin_token");
  const userToken = localStorage.getItem("token");
  const token = adminToken || userToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ===== RESPONSE INTERCEPTOR =====
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

// ====================================================================
// ============================ USER API ==============================
// ====================================================================

// ===== AUTH (USER) =====
export const login = (data) => api.post("/login", data);
export const register = (data) => api.post("/register", data);
export const getUser = () => api.get("/v1/user");
export const logout = () => api.post("/v1/logout");

// ===== CATALOG (PUBLIC) =====
export const getProducts = (params = {}) => api.get("/v1/products", { params });
export const getProductDetail = (id) => api.get(`/v1/products/${id}`);
export const getCategories = () => api.get("/v1/categories");
export const getBanners = () => api.get("/v1/banners");
export const getFaqs = () => api.get("/v1/faqs");

// ===== SETTINGS (PUBLIC) ===== // ✅ THÊM MỚI
export const getSettings = () => api.get("/v1/settings");

// ===== CHECKOUT / ORDERS (USER) =====
export const quoteCheckout = (payload) => api.post("/v1/checkout/quote", payload);
export const createOrder = (payload) => api.post("/v1/orders", payload);
export const getOrders = (params = {}) => api.get("/v1/orders", { params });
export const getOrderDetail = (id) => api.get(`/v1/orders/${id}`);
export const cancelOrder = (id) => api.post(`/v1/orders/${id}/cancel`);

// ✅ THÊM: VNPay – tạo URL thanh toán
export const vnpayCreate = (orderId) =>
  api.post("/v1/payment/vnpay/create", { order_id: orderId });

// ===== WISHLIST (USER) =====
export const fetchWishlist = () => api.get("/v1/wishlist");
export const addWishlist = (productId) =>
  api.post("/v1/wishlist", { product_id: Number(productId) });
export const removeWishlist = (productId) =>
  api.delete(`/v1/wishlist/${Number(productId)}`);

// ===== UTIL (Checkout.jsx) =====
export const mapCartToItems = (cart = []) =>
  cart.map((p) => ({ id: Number(p.id), qty: Number(p.qty ?? 1) }));

// ====================================================================
// ============================ ADMIN API =============================
// ====================================================================

// ===== AUTH (ADMIN) =====
export const adminLogin = (data) => api.post("/v1/admin/login", data);
export const adminMe = () => api.get("/v1/admin/me");
export const adminLogout = () => api.post("/v1/admin/logout");

// ===== DASHBOARD =====
export const adminGetDashboard = (params = {}) =>
  api.get("/v1/admin/dashboard", { params });

// ===== ADMIN PRODUCTS =====
export const adminGetProducts = (params = {}) =>
  api.get("/v1/admin/products", { params });

export const adminCreateProduct = (payload = {}) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return api.post("/v1/admin/products", fd);
};

export const adminUpdateProduct = (id, payload = {}) => {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v);
  });
  return api.post(`/v1/admin/products/${id}`, fd);
};

export const adminDeleteProduct = (id) =>
  api.delete(`/v1/admin/products/${id}`);

// ===== ADMIN CATEGORIES =====
export const adminGetCategories = (params = {}) =>
  api.get("/v1/admin/categories", { params });

export const adminCreateCategory = (payload = {}) =>
  api.post("/v1/admin/categories", payload);

export const adminUpdateCategory = (id, payload = {}) =>
  api.post(`/v1/admin/categories/${id}`, payload);

export const adminDeleteCategory = (id) =>
  api.delete(`/v1/admin/categories/${id}`);

// ===== ADMIN ORDERS =====
export const adminGetOrders = (params = {}) =>
  api.get("/v1/admin/orders", { params });

export const adminGetOrder = (id) => api.get(`/v1/admin/orders/${id}`);

export const adminDeleteOrder = (id) => api.delete(`/v1/admin/orders/${id}`);

/**
 * ✅ Cập nhật trạng thái đơn hàng (kèm ghi chú)
 */
export const adminUpdateOrderStatus = (id, status, note) =>
  api.post(`/v1/admin/orders/${id}/status`, { status, note });

/**
 * ✅ Tải file hóa đơn PDF
 */
export const adminDownloadInvoice = (id) =>
  api.get(`/v1/admin/orders/${id}/invoice`, { responseType: "blob" });

// ===== ADMIN USERS =====
export const adminGetUsers = (params = {}) =>
  api.get("/v1/admin/users", { params });

export const adminGetUser = (id) => api.get(`/v1/admin/users/${id}`);

export const adminUpdateUser = (id, payload) =>
  api.post(`/v1/admin/users/${id}`, payload);

export const adminBanUser = (id) => api.post(`/v1/admin/users/${id}/ban`);
export const adminUnbanUser = (id) => api.post(`/v1/admin/users/${id}/unban`);
export const adminLogoutAllUser = (id) =>
  api.post(`/v1/admin/users/${id}/logout-all`);

// ====================================================================
// ========================= ADMIN SETTINGS ===========================
// ====================================================================

// ===== SETTINGS =====
export const adminGetSettings = () => api.get("/v1/admin/settings");

export const adminSaveSettings = (settings = {}) => {
  const fd = new FormData();
  const { logo, ...rest } = settings || {};
  fd.append("settings", JSON.stringify(rest || {}));
  if (logo instanceof File) fd.append("logo", logo);
  return api.post("/v1/admin/settings", fd);
};

// ===== EXPORT DEFAULT =====
export default api;

// === KẾT FILE: src/services/api.js ===
