import { useMemo } from "react";

/**
 * VariantsPicker
 * props:
 *  - variants: [{ id, sku, name, slug, attrs: { color, storage, ... }, price_override, sale_price_override, stock, is_default }]
 *  - selected: { [attrKey]: attrValue }  // ví dụ { color: "Đen", storage: "256GB" }
 *  - onChange(selectedAttrs) => void
 *
 * Component sẽ tự:
 *  - gom các khóa attr (color, storage, ram, ssd, ...) từ tất cả variants
 *  - render từng nhóm lựa chọn (pills)
 *  - khi chọn đủ attr -> xác định biến thể match
 */
export default function VariantsPicker({ variants = [], selected = {}, onChange }) {
  const { groups, keys } = useMemo(() => {
    const allKeys = new Set();
    const map = {};
    variants.forEach(v => {
      const attrs = v.attrs || {};
      Object.keys(attrs).forEach(k => {
        allKeys.add(k);
        map[k] = map[k] || new Set();
        map[k].add(attrs[k]);
      });
    });
    // convert Set -> Array
    const groups = {};
    Object.keys(map).forEach(k => (groups[k] = Array.from(map[k])));
    const keys = Array.from(allKeys);
    return { groups, keys };
  }, [variants]);

  if (!variants.length || !keys.length) {
    return null;
  }

  const handlePick = (k, val) => {
    const next = { ...(selected || {}) };
    next[k] = val;
    onChange?.(next);
  };

  const isActive = (k, val) => (selected?.[k] === val);

  return (
    <div className="space-y-4">
      {keys.map((k) => (
        <div key={k}>
          <div className="text-sm font-medium mb-2">Chọn {labelOf(k)}:</div>
          <div className="flex flex-wrap gap-2">
            {(groups[k] || []).map((val) => (
              <button
                key={val}
                type="button"
                className={`px-3 py-2 rounded-lg border text-sm transition ${
                  isActive(k, val)
                    ? "border-blue-600 text-blue-700 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => handlePick(k, val)}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function labelOf(k) {
  switch (k) {
    case "color": return "màu";
    case "storage": return "dung lượng";
    case "ram": return "RAM";
    case "ssd": return "SSD";
    default: return k;
  }
}
