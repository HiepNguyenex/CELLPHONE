import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "recently_viewed";

const ViewedContext = createContext({
  viewed: [],
  addViewed: () => {},
  clearViewed: () => {},
});

export function ViewedProvider({ children }) {
  const [viewed, setViewed] = useState([]);

  // Load 1 lần
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setViewed(saved);
    } catch {}
  }, []);

  // Lưu mỗi khi đổi list
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
    } catch {}
  }, [viewed]); // CHỈ [viewed], không dùng [...viewed]

  // Chuẩn hoá dữ liệu lưu (tránh nhét cả object rất lớn vào storage)
  const normalize = useCallback((p) => ({
    id: p.id,
    name: p.name,
    image_url: p.image_url,
    final_price: p.final_price ?? p.price ?? 0,
    brand: p.brand?.name ?? p.brand_name ?? null,
  }), []);

  // Thêm sản phẩm đã xem (dedupe, đưa lên đầu, tối đa 10)
  const addViewed = useCallback((product) => {
    if (!product?.id) return;
    const item = normalize(product);
    setViewed((prev) => {
      const filtered = prev.filter((x) => x.id !== item.id);
      return [item, ...filtered].slice(0, 10);
    });
  }, [normalize]);

  const clearViewed = useCallback(() => setViewed([]), []);

  const value = useMemo(() => ({ viewed, addViewed, clearViewed }), [viewed, addViewed, clearViewed]);

  return <ViewedContext.Provider value={value}>{children}</ViewedContext.Provider>;
}

export const useViewed = () => useContext(ViewedContext);
