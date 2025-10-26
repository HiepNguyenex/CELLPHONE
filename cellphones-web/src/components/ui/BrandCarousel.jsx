import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getBrands } from "../../services/api";
import { resolveImg } from "../../utils/img";

function BrandCard({ b }) {
  const [imgOk, setImgOk] = useState(Boolean(b.logo));
  const letter = (b.name || "?").slice(0,1).toUpperCase();
  const src = b.logo ? resolveImg(b.logo) : "";

  return (
    <Link to={`/search?brand_id=${b.id}`} className="group flex-shrink-0 w-[120px] md:w-[140px] snap-start">
      <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-3
                      flex flex-col items-center gap-2 transition
                      hover:-translate-y-0.5 hover:shadow-md">
        <div className="size-14 md:size-16 rounded-full grid place-items-center bg-gray-50 ring-1 ring-gray-100 overflow-hidden relative">
          {imgOk ? (
            <img
              src={src}
              alt={b.name}
              className="h-10 w-10 md:h-12 md:w-12 object-contain transition group-hover:scale-[1.05]"
              onError={() => setImgOk(false)}
              loading="lazy"
            />
          ) : (
            <span className="text-sm md:text-base font-semibold text-gray-600">{letter}</span>
          )}
        </div>
        <div className="text-xs md:text-sm text-center font-medium text-gray-700 line-clamp-1">
          {b.name}
        </div>
      </div>
    </Link>
  );
}

export default function BrandCarousel({ title = "Thương hiệu nổi bật", limit = 20 }) {
  const [brands, setBrands] = useState([]);
  const railRef = useRef(null);

  useEffect(() => {
    const ac = new AbortController();
    getBrands({ limit: 100 }, ac.signal).then(res => {
      const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      // Khử trùng theo id/slug/name
      const seen = new Set();
      const uniq = [];
      for (const b of arr) {
        const key = b.id ?? b.slug ?? (b.name || "").toLowerCase().trim();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        uniq.push(b);
      }
      setBrands(uniq.slice(0, limit));
    });
    return () => ac.abort();
  }, [limit]);

  const scrollBy = (dx) => railRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  if (!brands.length) return null;

  return (
    <section className="relative">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg md:text-xl font-semibold">{title}</h3>
        <div className="hidden md:flex gap-2">
          <button onClick={()=>scrollBy(-300)} className="px-3 py-2 rounded-xl border hover:bg-gray-50">‹</button>
          <button onClick={()=>scrollBy(300)}  className="px-3 py-2 rounded-xl border hover:bg-gray-50">›</button>
        </div>
      </div>
      <div
        ref={railRef}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1
                   [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {brands.map((b) => <BrandCard key={`${b.id}-${b.slug || b.name}`} b={b} />)}
      </div>
    </section>
  );
}
