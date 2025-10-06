import { createContext, useContext, useState, useEffect } from "react";
import { getUser, login as apiLogin, register as apiRegister, logout as apiLogout } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tải thông tin user nếu có token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getUser()
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Login
  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // Register
  const register = async (name, email, password) => {
    await apiRegister({ name, email, password });
  };

  // Logout
  const logout = async () => {
    try {
      await apiLogout();
    } catch {}
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
