import { useState, useMemo } from "react";

/**
 * props:
 *  - images: [{ id?, url, is_primary?, position? }]
 *  - alt: string
 */
export default function ProductGallery({ images = [], alt = "Product image" }) {
  const normalized = useMemo(() => {
    const arr = (images || [])
      .filter(Boolean)
      .map((x, i) => ({ id: x.id ?? i, url: x.url, is_primary: !!x.is_primary, position: x.position ?? i }))
      .filter((x) => !!x.url);

    if (!arr.length) {
      return [{ id: 0, url: "https://via.placeholder.com/800x800?text=No+Image", is_primary: true, position: 0 }];
    }

    // Ưu tiên ảnh primary
    arr.sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      if (a.position !== b.position) return a.position - b.position;
      return (a.id ?? 0) - (b.id ?? 0);
    });

    return arr;
  }, [images]);

  const [active, setActive] = useState(0);

  const current = normalized[active] ?? normalized[0];

  return (
    <div className="w-full">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-50 border">
        <img
          src={current?.url}
          alt={alt}
          className="h-full w-full object-contain"
          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x800?text=No+Image")}
        />
      </div>

      <div className="mt-3 grid grid-cols-5 md:grid-cols-6 gap-2">
        {normalized.map((img, idx) => (
          <button
            key={img.id ?? idx}
            onClick={() => setActive(idx)}
            className={`aspect-square rounded-md overflow-hidden border ${idx === active ? "ring-2 ring-red-500" : "hover:border-gray-400"}`}
            title={`Ảnh ${idx + 1}`}
          >
            <img
              src={img.url}
              alt={`thumb-${idx}`}
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/200x200?text=No+Image")}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
