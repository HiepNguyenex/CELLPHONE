import React, { useMemo } from "react";

export default function ProductSpecs({ product, matchedVariant }) {
  const specs = useMemo(() => {
    if (!product?.specs) return {};

    // ✅ Dữ liệu specs dạng object có nhóm
    const s = product.specs;

    // Gộp specs base + variant override (nếu có)
    if (matchedVariant?.attrs) {
      Object.entries(matchedVariant.attrs).forEach(([k, v]) => {
        if (typeof v === "string" && v.trim() !== "") {
          // Tìm xem key nằm nhóm nào
          for (const groupKey in s) {
            const group = s[groupKey];
            if (group[k]) s[groupKey][k] = v;
          }
        }
      });
    }

    return s;
  }, [product, matchedVariant]);

  if (!specs || Object.keys(specs).length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-3">Thông số kỹ thuật</h2>
      <div className="overflow-hidden rounded-lg border divide-y">
        {Object.entries(specs).map(([group, items]) => (
          <div key={group} className="bg-white">
            <div className="bg-gray-100 px-4 py-2 font-medium text-gray-800 uppercase text-sm">
              {group}
            </div>
            <table className="min-w-full text-sm">
              <tbody className="divide-y">
                {Object.entries(items).map(([key, val]) => (
                  <tr key={key} className="odd:bg-gray-50">
                    <th className="w-48 p-3 text-left font-medium text-gray-700 align-top">
                      {key}
                    </th>
                    <td className="p-3 text-gray-800">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500">
        * Thông số có thể thay đổi tuỳ phiên bản.
      </p>
    </div>
  );
}
