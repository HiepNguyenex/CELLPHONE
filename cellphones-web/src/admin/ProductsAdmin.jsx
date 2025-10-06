import { useEffect, useState } from "react";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  getCategories,
} from "../services/api";
import { Plus, Edit, Trash } from "lucide-react";
import { Dialog } from "@headlessui/react";
import ConfirmDialog from "../components/ConfirmDialog"; // ✅ thêm confirm dialog

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null }); // ✅ thêm state xác nhận xoá

  const [form, setForm] = useState({
    id: null,
    name: "",
    price: "",
    stock: 0,
    category_id: "",
    image: null,
    imagePreview: "",
  });

  // ===== Load danh sách sản phẩm + danh mục =====
  const load = async () => {
    const [pRes, cRes] = await Promise.all([
      adminGetProducts(),
      getCategories(),
    ]);
    setProducts(pRes?.data?.data ?? pRes?.data ?? []);
    setCategories(cRes?.data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  // ===== Mở form thêm/sửa =====
  const openModal = (p = null) => {
    if (p) {
      setForm({
        id: p.id,
        name: p.name ?? "",
        price: p.price ?? "",
        stock: p.stock ?? 0,
        category_id: p.category_id ?? "",
        image: null,
        imagePreview: p.image_url ?? "",
      });
    } else {
      setForm({
        id: null,
        name: "",
        price: "",
        stock: 0,
        category_id: "",
        image: null,
        imagePreview: "",
      });
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
    }));
  };

  // ===== Lưu (thêm/sửa) =====
  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: form.price,
        stock: form.stock,
        category_id: form.category_id || undefined,
      };
      if (form.image) payload.image = form.image;

      if (form.id) await adminUpdateProduct(form.id, payload);
      else await adminCreateProduct(payload);

      setIsOpen(false);
      await load();
    } catch (err) {
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

      <button
        onClick={() => openModal()}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        <Plus size={18} /> Thêm sản phẩm
      </button>

      <div className="mt-6 bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Ảnh</th>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Tồn kho</th>
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <img
                    src={
                      p.image_url ||
                      "https://dummyimage.com/64x64/eeeeee/000000&text=IMG"
                    }
                    alt={p.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-red-600 font-semibold">
                  {(Number(p.price) || 0).toLocaleString("vi-VN")}₫
                </td>
                <td className="p-3 text-center">{p.stock ?? 0}</td>
                <td className="p-3 text-right flex justify-end gap-2">
                  <button
                    onClick={() => openModal(p)}
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
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
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {form.id ? "✏️ Sửa sản phẩm" : "➕ Thêm sản phẩm"}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tên sản phẩm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
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
                placeholder="Tồn kho"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />
              <select
                className="w-full border px-3 py-2 rounded"
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div>
                <input type="file" accept="image/*" onChange={onFile} />
                {form.imagePreview && (
                  <img
                    src={form.imagePreview}
                    alt="preview"
                    className="mt-2 w-24 h-24 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
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

      {/* ✅ Confirm Dialog xoá */}
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
