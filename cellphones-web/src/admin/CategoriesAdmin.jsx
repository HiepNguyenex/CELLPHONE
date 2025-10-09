import { useEffect, useState } from "react";
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from "../services/api";
import { Plus, Edit, Trash, Search } from "lucide-react";
import { Dialog } from "@headlessui/react";
import ConfirmDialog from "../components/ConfirmDialog";

export default function CategoriesAdmin() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const [form, setForm] = useState({
    id: null,
    name: "",
    parent_id: "",
    sort_order: 0,
    is_active: true,
    description: "",
    icon: null,
    iconPreview: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetCategories(q ? { q } : {});
      setItems(res?.data ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const openModal = (c = null) => {
    if (c) {
      setForm({
        id: c.id,
        name: c.name || "",
        parent_id: c.parent_id || "",
        sort_order: c.sort_order || 0,
        is_active: !!c.is_active,
        description: c.description || "",
        icon: null,
        iconPreview: c.icon ? `${import.meta.env.VITE_API_URL.replace(/\/api$/, "")}/storage/${c.icon}` : "",
      });
    } else {
      setForm({
        id: null, name: "", parent_id: "", sort_order: 0,
        is_active: true, description: "", icon: null, iconPreview: "",
      });
    }
    setIsOpen(true);
  };

  const onFile = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((f) => ({
      ...f,
      icon: file,
      iconPreview: file ? URL.createObjectURL(file) : f.iconPreview,
    }));
  };

  const save = async () => {
    const data = new FormData();
    data.append("name", form.name);
    if (form.parent_id) data.append("parent_id", form.parent_id);
    data.append("sort_order", form.sort_order);
    data.append("is_active", form.is_active ? 1 : 0);
    data.append("description", form.description);
    if (form.icon) data.append("icon", form.icon);

    setSaving(true);
    try {
      if (form.id) await adminUpdateCategory(form.id, data);
      else await adminCreateCategory(data);
      setIsOpen(false);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Lưu danh mục thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => setConfirm({ open: true, id });
  const confirmDelete = async () => {
    await adminDeleteCategory(confirm.id);
    await load();
    setConfirm({ open: false, id: null });
  };

  return (
    <div>
      <div className="flex justify-between mb-6 items-center">
        <h2 className="text-2xl font-bold">🗂️ Quản lý danh mục</h2>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Tìm theo tên…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={load} className="border px-3 py-1 rounded hover:bg-gray-50">
            <Search size={16} />
          </button>
        </div>
      </div>

      <button
        onClick={() => openModal()}
        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        <Plus size={18} /> Thêm danh mục
      </button>

      <div className="mt-6 bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3 text-left">Tên danh mục</th>
              <th className="p-3 text-left">Hiển thị</th>
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center p-6">Đang tải...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-6">Chưa có danh mục</td></tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{c.id}</td>
                  <td className="p-3 flex items-center gap-2">
                    {c.icon && <img src={`${import.meta.env.VITE_API_URL.replace(/\/api$/, "")}/storage/${c.icon}`} className="w-6 h-6 rounded" />}
                    {c.name}
                  </td>
                  <td className="p-3">{c.is_active ? "✅" : "❌"}</td>
                  <td className="p-3 text-right flex justify-end gap-2">
                    <button onClick={() => openModal(c)} className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
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
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md space-y-3">
            <h3 className="text-lg font-semibold">{form.id ? "✏️ Sửa danh mục" : "➕ Thêm danh mục"}</h3>

            <input
              type="text"
              placeholder="Tên danh mục"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />

            <select
              className="w-full border px-3 py-2 rounded"
              value={form.parent_id}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
            >
              <option value="">-- Danh mục cha --</option>
              {items.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Hiển thị danh mục
            </label>

            <input
              type="number"
              placeholder="Thứ tự hiển thị"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />

            <textarea
              placeholder="Mô tả"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border px-3 py-2 rounded"
            />

            <div>
              <input type="file" accept="image/*" onChange={onFile} />
              {form.iconPreview && (
                <img src={form.iconPreview} alt="preview" className="mt-2 w-20 h-20 object-cover rounded" />
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={confirmDelete}
        title="Xác nhận xoá danh mục"
        message="Danh mục này sẽ bị xóa vĩnh viễn khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
