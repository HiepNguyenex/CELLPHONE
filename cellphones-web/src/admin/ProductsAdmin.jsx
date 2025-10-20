// src/admin/ProductsAdmin.jsx
import { useEffect, useState } from "react";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  getCategories,
  getBrands,
} from "../services/api";
import { Plus, Edit, Trash, Search, X } from "lucide-react";
import { Dialog } from "@headlessui/react";
import ConfirmDialog from "../components/ConfirmDialog";

// ===== ORIGIN helper (chuẩn với mọi kiểu VITE_API_URL: /api, /api/v1, ...)
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const ORIGIN = (() => {
  try {
    return new URL(API_BASE, window.location.origin).origin;
  } catch {
    return API_BASE.replace(/\/api(?:\/v\d+)?\/?$/i, "").replace(/\/+$/, "");
  }
})();

// ── Helper: format tiền & ảnh
const money = (v) => `${(Number(v) || 0).toLocaleString("vi-VN")}₫`;
const img = (u) => {
  if (!u) return "https://dummyimage.com/64x64/eeeeee/000000&text=IMG";
  if (/^https?:\/\//i.test(u)) return u; // đã là URL tuyệt đối
  const path = String(u).replace(/^\/+/, "");
  const rel = path.startsWith("storage/") ? path : `storage/${path}`;
  return `${ORIGIN}/${rel}`; // http://127.0.0.1:8000/storage/...
};

const emptyForm = {
  id: null,
  name: "",
  price: "",
  sale_price: "",
  stock: 0,
  category_id: "",
  brand_id: "",
  is_featured: false,
  short_description: "",
  description: "",
  specs: [], // [{key:"Màn hình", value:"6.1\""}, ...]
  image: null,
  imagePreview: "",
  imageUrl: "", // tuỳ chọn nhập URL ảnh thay vì upload
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Filter/search
  const [q, setQ] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBrand, setFilterBrand] = useState("");

  // Modal + form
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const [form, setForm] = useState(emptyForm);

  // ===== Load danh sách sản phẩm + danh mục + thương hiệu =====
  const load = async () => {
    const [pRes, cRes, bRes] = await Promise.all([
      adminGetProducts({
        q: q || undefined,
        category_id: filterCategory || undefined,
        brand_id: filterBrand || undefined,
      }),
      getCategories(),
      getBrands(),
    ]);
    setProducts(pRes?.data?.data ?? pRes?.data ?? []);
    setCategories(cRes?.data ?? []);
    setBrands(bRes?.data ?? []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== Mở form thêm/sửa =====
  const openModal = (p = null) => {
    if (p) {
      const specsArr = Array.isArray(p.specs)
        ? p.specs
        : p.specs && typeof p.specs === "object"
        ? Object.entries(p.specs).map(([key, value]) => ({ key, value: String(value ?? "") }))
        : [];

      setForm({
        id: p.id,
        name: p.name ?? "",
        price: p.price ?? "",
        sale_price: p.sale_price ?? "",
        stock: p.stock ?? 0,
        category_id: p.category_id ?? "",
        brand_id: p.brand_id ?? "",
        is_featured: !!p.is_featured,
        short_description: p.short_description ?? "",
        description: p.description ?? "",
        specs: specsArr,
        image: null,
        imagePreview: p.image_url || p.image || "",
        imageUrl: "", // không bind url cũ
      });
    } else {
      setForm(emptyForm);
    }
    setIsOpen(true);
  };

  // ===== Chọn file ảnh =====
  const onFile = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({
      ...f,
      image: file,
      imagePreview: file ? URL.createObjectURL(file) : f.imagePreview,
      imageUrl: file ? "" : f.imageUrl, // nếu chọn file thì xoá url để tránh nhầm
    }));
  };

  // ===== Thêm/xoá dòng thông số =====
  const addSpec = () => setForm((f) => ({ ...f, specs: [...f.specs, { key: "", value: "" }] }));
  const removeSpec = (idx) =>
    setForm((f) => ({ ...f, specs: f.specs.filter((_, i) => i !== idx) }));
  const updateSpec = (idx, field, value) =>
    setForm((f) => ({
      ...f,
      specs: f.specs.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    }));

  // ===== Lưu (thêm/sửa) =====
  const save = async () => {
    setSaving(true);
    try {
      // Chuẩn hoá specs → object
      const cleanSpecs = {};
      (form.specs || []).forEach((row) => {
        const key = (row.key || "").trim();
        if (key) cleanSpecs[key] = row.value ?? "";
      });

      // Ưu tiên upload file; nếu không có file và có URL, gửi image_url
      const payload = {
        name: form.name,
        price: form.price,
        sale_price: form.sale_price || undefined,
        stock: form.stock,
        category_id: form.category_id || undefined,
        brand_id: form.brand_id || undefined,
        is_featured: form.is_featured ? 1 : 0,
        short_description: form.short_description || undefined,
        description: form.description || undefined,
        specs: Object.keys(cleanSpecs).length ? JSON.stringify(cleanSpecs) : undefined,
      };

      if (form.image) payload.image = form.image;
      else if (form.imageUrl) payload.image_url = form.imageUrl;

      if (form.id) await adminUpdateProduct(form.id, payload);
      else await adminCreateProduct(payload);

      setIsOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Lưu sản phẩm thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ===== Xác nhận xoá =====
  const handleDelete = (id) => setConfirm({ open: true, id });
  const confirmDelete = async () => {
    if (!confirm.id) return;
    try {
      await adminDeleteProduct(confirm.id);
      await load();
    } catch (err) {
      alert("Không thể xóa sản phẩm này!");
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📦 Quản lý sản phẩm</h2>

      {/* Thanh công cụ: Thêm + Search + Filter */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          <Plus size={18} /> Thêm sản phẩm
        </button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên/sku..."
              className="border rounded pl-9 pr-3 py-2 w-56"
            />
            <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>

          <select
            className="border rounded px-3 py-2"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            <option value="">Tất cả thương hiệu</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <button onClick={load} className="px-3 py-2 rounded border hover:bg-gray-50" title="Áp dụng lọc">
            Lọc
          </button>
        </div>
      </div>

      <div className="mt-6 bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Ảnh</th>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-left">Thương hiệu</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Tồn kho</th>
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <img src={img(p.image_url || p.image)} alt={p.name} className="w-16 h-16 rounded object-cover" />
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.brand?.name || p.brand_name || "-"}</td>
                <td className="p-3 text-red-600 font-semibold">{money(p.price)}</td>
                <td className="p-3 text-center">{p.stock ?? 0}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openModal(p)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      title="Sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                      title="Xoá"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Chưa có sản phẩm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa sản phẩm */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">{form.id ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm"}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Tên sản phẩm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border px-3 py-2 rounded md:col-span-2"
              />

              <input
                type="number"
                placeholder="Giá"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <input
                type="number"
                placeholder="Giá khuyến mãi"
                value={form.sale_price}
                onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              <input
                type="number"
                placeholder="Tồn kho"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
                Sản phẩm nổi bật
              </label>

              {/* Danh mục */}
              <select
                className="w-full border px-3 py-2 rounded"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Thương hiệu */}
              <select
                className="w-full border px-3 py-2 rounded"
                value={form.brand_id}
                onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
              >
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Ảnh: URL hoặc Upload */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">URL ảnh (tuỳ chọn)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value, image: null })}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Tải ảnh (PNG/JPG)</label>
                  <input type="file" accept="image/*" onChange={onFile} />
                </div>
                {(form.imagePreview || form.imageUrl) && (
                  <img
                    src={form.image ? URL.createObjectURL(form.image) : (form.imageUrl || img(form.imagePreview))}
                    alt="preview"
                    className="mt-2 w-32 h-32 object-cover rounded border"
                  />
                )}
              </div>

              {/* Mô tả ngắn */}
              <textarea
                placeholder="Mô tả ngắn"
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                className="w-full border px-3 py-2 rounded md:col-span-2"
                rows={2}
              />

              {/* Mô tả chi tiết */}
              <textarea
                placeholder="Mô tả chi tiết"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border px-3 py-2 rounded md:col-span-2"
                rows={4}
              />

              {/* Thông số kỹ thuật */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Thông số kỹ thuật</span>
                  <button type="button" onClick={addSpec} className="px-2 py-1 border rounded text-sm">
                    + Thêm dòng
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {form.specs.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2">
                      <input
                        className="border rounded px-2 py-1 col-span-5"
                        placeholder="Thuộc tính (vd. Màn hình)"
                        value={row.key}
                        onChange={(e) => updateSpec(idx, "key", e.target.value)}
                      />
                      <input
                        className="border rounded px-2 py-1 col-span-6"
                        placeholder={'Giá trị (vd. 6.1")'}
                        value={row.value}
                        onChange={(e) => updateSpec(idx, "value", e.target.value)}
                      />
                      <button
                        type="button"
                        className="col-span-1 flex items-center justify-center border rounded hover:bg-gray-50"
                        onClick={() => removeSpec(idx)}
                        title="Xoá dòng"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}

                  {form.specs.length === 0 && (
                    <div className="text-sm text-gray-500">Chưa có dòng nào. Nhấn “+ Thêm dòng”.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-300 rounded">
                Hủy
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Confirm Dialog xoá */}
      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={confirmDelete}
        title="Xác nhận xoá sản phẩm"
        message="Hành động này sẽ xóa vĩnh viễn sản phẩm khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Xóa sản phẩm"
        cancelText="Hủy"
      />
    </div>
  );
}
