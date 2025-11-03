// src/context/ViewedContext.jsx
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

  // Chuẩn hoá 1 item lưu vào localStorage (tính đúng final_price)
  const normalize = useCallback((p = {}) => {
    const price = Number(p?.price ?? 0);
    const sale =
      p?.sale_price != null && p?.sale_price !== ""
        ? Number(p.sale_price)
        : null;

    const final_price =
      p?.final_price != null && p?.final_price !== ""
        ? Number(p.final_price)
        : sale != null && sale < price
        ? sale
        : price;

    return {
      id: p.id,
      name: String(p.name ?? ""),
      image_url: p.image_url ?? p.image ?? null,
      brand: p.brand?.name ?? p.brand_name ?? null,
      price,
      sale_price: sale,
      final_price,
    };
  }, []);

  // Load 1 lần + tự "vá" dữ liệu cũ
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || "[]";
      const saved = JSON.parse(raw);
      const arr = Array.isArray(saved) ? saved.map(normalize) : [];
      setViewed(arr);
    } catch {
      setViewed([]);
    }
  }, [normalize]);

  // Lưu mỗi khi đổi list
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
    } catch {}
  }, [viewed]);

  // Thêm sản phẩm đã xem (dedupe, đưa lên đầu, tối đa 10)
  const addViewed = useCallback(
    (product) => {
      if (!product?.id) return;
      const item = normalize(product);
      setViewed((prev) => {
        const filtered = prev.filter((x) => String(x.id) !== String(item.id));
        return [item, ...filtered].slice(0, 10);
      });
    },
    [normalize]
  );

  const clearViewed = useCallback(() => setViewed([]), []);

  const value = useMemo(
    () => ({ viewed, addViewed, clearViewed }),
    [viewed, addViewed, clearViewed]
  );

  return (
    <ViewedContext.Provider value={value}>{children}</ViewedContext.Provider>
  );
}

export const useViewed = () => useContext(ViewedContext);
