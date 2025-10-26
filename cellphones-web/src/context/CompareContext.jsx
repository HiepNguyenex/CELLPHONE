import { createContext, useContext, useEffect, useState } from "react";

const CompareContext = createContext();

export function CompareProvider({ children }) {
  const [compare, setCompare] = useState([]);

  // Load từ localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("compare_products") || "[]");
    setCompare(saved);
  }, []);

  // Lưu vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem("compare_products", JSON.stringify(compare));
  }, [compare]);

  const addToCompare = (product) => {
    setCompare((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev;
      if (prev.length >= 3) {
        alert("Chỉ có thể so sánh tối đa 3 sản phẩm!");
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromCompare = (id) =>
    setCompare((prev) => prev.filter((p) => p.id !== id));

  const clearCompare = () => setCompare([]);

  return (
    <CompareContext.Provider
      value={{ compare, addToCompare, removeFromCompare, clearCompare }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
