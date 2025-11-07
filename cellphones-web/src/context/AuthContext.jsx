// === FILE: src/context/AuthContext.jsx ===
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getUser, login as apiLogin, register as apiRegister, logout as apiLogout } from "../services/api";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// LocalStorage keys
const USER_TOKEN_KEY  = "token";
const ADMIN_TOKEN_KEY = "admin_token";
const USER_CACHE_KEY  = "user_cache_v1";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // đừng render nút "Đăng nhập" khi loading

  // Hydrate từ cache + refresh nền
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const token = localStorage.getItem(USER_TOKEN_KEY);
        const admin = localStorage.getItem(ADMIN_TOKEN_KEY);

        // Không có token -> coi như chưa đăng nhập
        if (!token && !admin) {
          setLoading(false);
          return;
        }

        // ⚡ Hydrate UI ngay từ cache để không "out" khi F5
        const cached = localStorage.getItem(USER_CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === "object") setUser(parsed);
          } catch {}
        }

        // Refresh user từ BE (nền). Chỉ xóa token khi 401/419
        const res = await getUser(ac.signal);
        const u = res?.data ?? res ?? null;
        setUser(u);
        // cập nhật cache
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u || null));
      } catch (e) {
        const status = e?.response?.status;
        // ❗️Chỉ khi thật sự hết hạn / không hợp lệ mới xóa token
        if (status === 401 || status === 419) {
          localStorage.removeItem(USER_TOKEN_KEY);
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          localStorage.removeItem(USER_CACHE_KEY);
          setUser(null);
        } else {
          // mạng lỗi / timeout / abort -> GIỮ token & cache, không xóa
          // giữ nguyên state user (hydrated từ cache)
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // ==== Actions người dùng ====
  const login = async (email, password) => {
    const res  = await apiLogin({ email, password });
    const data = res?.data ?? {};
    if (data?.token) localStorage.setItem(USER_TOKEN_KEY, data.token);
    if (data?.user)  {
      setUser(data.user);
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (name, email, password) => {
    return apiRegister({ name, email, password });
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(USER_CACHE_KEY);
    setUser(null);
  };

  // Tuỳ lúc cần gọi lại để đồng bộ user từ server
  const refreshUser = async () => {
    const res = await getUser();
    const u   = res?.data ?? res ?? null;
    setUser(u);
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(u || null));
    return u;
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    setUser,
    isAdmin: !!user?.is_admin,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
