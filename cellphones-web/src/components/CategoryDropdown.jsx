import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import {
  Smartphone,
  Headphones,
  Laptop2,
  ChevronDown,
  FolderOpenDot,
} from "lucide-react";

const CAT_MAP = {
  "Audio & Accessories": { label: "Âm thanh & Phụ kiện", Icon: Headphones },
  Accessories: { label: "Phụ kiện", Icon: Headphones },
  Laptops: { label: "Laptop", Icon: Laptop2 },
  Smartphones: { label: "Điện thoại", Icon: Smartphone },
  "Smartphones & Tablets": { label: "Điện thoại & Tablet", Icon: Smartphone },
};

function getMeta(name) {
  return CAT_MAP[name] || { label: name, Icon: FolderOpenDot };
}

export default function CategoryDropdown() {
  const [open, setOpen] = useState(false);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/v1/categories");
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCats(list);
      } catch (e) {
        console.error("Lỗi tải danh mục:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Đóng dropdown khi điều hướng route
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex items-center gap-2 bg-red-700 hover:bg-red-800 px-3 py-2 rounded"
      >
        <span className="text-lg">☰</span>
        <span className="font-medium">Danh mục</span>
        <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-[420px] md:w-[560px] bg-white text-black rounded-2xl shadow-xl ring-1 ring-black/5 z-50 p-3">
          {loading ? (
            <div className="p-4 text-gray-500">Đang tải danh mục…</div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {cats.map((c) => {
                const { label, Icon } = getMeta(c.name);
                return (
                  <li key={c.id}>
                    <Link
                      to={`/search?category_id=${c.id}`}
                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-100 transition"
                    >
                      <span className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 ring-1 ring-red-100">
                          <Icon className="w-4 h-4 text-red-600" />
                        </span>
                        <span className="font-medium">{label}</span>
                      </span>
                      {typeof c.products_count === "number" && (
                        <span className="text-xs text-gray-500">{c.products_count}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
