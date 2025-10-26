// src/admin/BundlesAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  adminGetBundles,
  adminUpsertBundles,   // ✅ dùng tên MỚI
  adminDetachBundle,    // ✅ dùng tên MỚI
  adminGetProduct,
  adminGetProducts,
} from "../services/api";

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-5 mb-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function BundlesAdmin() {
  const [productId, setProductId] = useState(1);
  const [product, setProduct] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(false);

  // form add/update
  const [bundleProductId, setBundleProductId] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");

  // quick search
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const loadBundles = async (pid = productId) => {
    setLoading(true);
    try {
      const [resBundles, resProduct] = await Promise.all([
        adminGetBundles(pid),
        adminGetProduct(pid),
      ]);
      const list =
        resBundles?.data?.data ??
        resBundles?.data?.bundles ??
        resBundles?.data ??
        [];
      setBundles(Array.isArray(list) ? list : []);
      setProduct(resProduct?.data?.data ?? resProduct?.data ?? null);
    } catch (e) {
      console.error(e);
      setBundles([]);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBundles(productId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleAddOrUpdate = async (e) => {
    e?.preventDefault?.();
    const bpid = Number(bundleProductId);
    const pct = Number(discountPercent);
    if (!productId || !bpid || pct < 0) return;

    try {
      // ✅ gọi đúng tên hàm
      await adminUpsertBundles(productId, [
        { bundle_product_id: bpid, discount_percent: pct },
      ]);
      setBundleProductId("");
      setDiscountPercent("");
      await loadBundles(productId);
      alert("Đã lưu combo (upsert)!");
    } catch (err) {
      console.error(err);
      alert("Lưu combo thất bại!");
    }
  };

  const handleRemove = async (bpid) => {
    if (!confirm("Xóa combo này?")) return;
    try {
      // ✅ gọi đúng tên hàm
      await adminDetachBundle(productId, Number(bpid));
      await loadBundles(productId);
      alert("Đã xóa combo!");
    } catch (err) {
      console.error(err);
      alert("Xóa combo thất bại!");
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    try {
      const res = await adminGetProducts({ q: search, per_page: 10 });
      const items =
        res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
      setSearchResults(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    }
  };

  const title = useMemo(
    () =>
      product
        ? `${product?.name || "Sản phẩm"} (ID: ${productId})`
        : `Sản phẩm ID: ${productId}`,
    [product, productId]
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Quản lý Combo / Bundles</h2>

      <Section title="Chọn sản phẩm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadBundles(productId);
          }}
          className="flex gap-3 items-end flex-wrap"
        >
          <div>
            <label className="block text-sm mb-1">Product ID</label>
            <input
              type="number"
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value || 0))}
              className="border rounded px-3 py-2 w-40"
              min={1}
              required
            />
          </div>

          <div className="flex-1 min-w-[220px]">
            <label className="block text-sm mb-1">Tìm nhanh sản phẩm</label>
            <div className="flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tên/slug"
                className="border rounded px-3 py-2 w-full"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Tìm
              </button>
            </div>
            {!!searchResults.length && (
              <div className="border rounded mt-2 max-h-56 overflow-auto">
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProductId(Number(p.id));
                      setSearch("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                  >
                    #{p.id} — {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            Tải bundles
          </button>
        </form>
      </Section>

      <Section title={`Bundles của: ${title}`}>
        <div className="overflow-auto">
          <table className="min-w-[720px] w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-3 py-2 border">#</th>
                <th className="text-left px-3 py-2 border">Bundle Product ID</th>
                <th className="text-left px-3 py-2 border">% Giảm</th>
                <th className="text-left px-3 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center">
                    Đang tải…
                  </td>
                </tr>
              ) : bundles.length ? (
                bundles.map((b, idx) => {
                  const bpid = b.bundle_product_id ?? b.id; // id từ JOIN là id của SP bundle
                  const pct =
                    b.discount_percent ?? b.discountPercent ?? b.discount ?? 0;
                  return (
                    <tr key={`${bpid}-${idx}`}>
                      <td className="px-3 py-2 border">{idx + 1}</td>
                      <td className="px-3 py-2 border">{bpid}</td>
                      <td className="px-3 py-2 border">{pct}%</td>
                      <td className="px-3 py-2 border">
                        <button
                          onClick={() => handleRemove(bpid)}
                          className="px-3 py-1 rounded bg-red-600 text-white"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center">
                    Chưa có combo nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Thêm / Cập nhật combo (Upsert)">
        <form onSubmit={handleAddOrUpdate} className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-sm mb-1">Bundle Product ID</label>
            <input
              type="number"
              value={bundleProductId}
              onChange={(e) => setBundleProductId(e.target.value)}
              className="border rounded px-3 py-2 w-48"
              min={1}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">% Giảm</label>
            <input
              type="number"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className="border rounded px-3 py-2 w-32"
              step="1"
              min={0}
              max={100}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded self-end"
          >
            Lưu (Upsert)
          </button>
        </form>
      </Section>
    </div>
  );
}
