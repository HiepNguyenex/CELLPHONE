import { useEffect, useState } from "react";
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../services/api";
import { Plus, Edit, Trash, Search } from "lucide-react";
import { Dialog } from "@headlessui/react";
import ConfirmDialog from "../components/ConfirmDialog"; // ✅ Thêm modal xác nhận chung

export default function CategoriesAdmin() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null }); // ✅ Thêm confirm modal
  const [form, setForm] = useState({ id: null, name: "" });

  // ===== Load danh mục =====
  const load = async () => {
    try {
      setLoading(true);
      const res = await adminGetCategories(q ? { q } : {});
      setItems(res?.data?.data ?? res?.data ?? []);
    } catch (err) {
      console.error(err);
      alert("Không tải được danh mục. Kiểm tra token admin hoặc API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = async (e) => {
    e.preventDefault();
    await load();
  };

  // ===== Mở modal thêm/sửa =====
  const openModal = (c = null) => {
    if (c) setForm({ id: c.id, name: c.name });
    else setForm({ id: null, name: "" });
    setIsOpen(true);
  };

  // ===== Lưu danh mục =====
  const save = async () => {
    const name = form.name.trim();
    if (!name) return;
    setSaving(true);
    try {
      const payload = { name };
      if (form.id) await adminUpdateCategory(form.id, payload);
      else await adminCreateCategory(payload);
      setIsOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Lưu danh mục thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ===== Xác nhận xoá =====
  const handleDelete = (id) => setConfirm({ open: true, id });

  const confirmDelete = async () => {
    if (!confirm.id) return;
    try {
      await adminDeleteCategory(confirm.id);
      await load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Xoá danh mục thất bại");
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">🗂️ Quản lý danh mục</h2>

        <form onSubmit={onSearch} className="flex items-center gap-2">
          <div className="flex items-center bg-white border rounded px-2">
            <Search size={16} className="opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo tên…"
              className="px-2 py-1 outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50"
          >
            Tìm
          </button>
        </form>
      </div>

      {/* ===== Thêm danh mục ===== */}
      <button
        onClick={() => openModal()}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        <Plus size={18} /> Thêm danh mục
      </button>

      {/* ===== Bảng danh mục ===== */}
      <div className="mt-6 bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left w-16">#</th>
              <th className="p-3 text-left">Tên danh mục</th>
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  Đang tải…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-gray-500">
                  Chưa có danh mục.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{c.id}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <button
                      onClick={() => openModal(c)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)} // ✅ thay confirm()
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Modal thêm/sửa ===== */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {form.id ? "✏️ Sửa danh mục" : "➕ Thêm danh mục"}
            </h3>

            <input
              type="text"
              placeholder="Tên danh mục"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Hủy
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name.trim()}
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
        title="Xác nhận xoá danh mục"
        message="Danh mục này sẽ bị xóa vĩnh viễn khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Xóa danh mục"
        cancelText="Hủy"
      />
    </div>
  );
}
