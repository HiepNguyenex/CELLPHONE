// ✅ TỆP MỚI: src/admin/BrandsAdmin.jsx
import { useEffect, useState } from "react";
import {
  adminGetBrands,
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand,
} from "../services/api";

const init = { name: "", slug: "", description: "", is_active: true, sort_order: 0, logo: null };

export default function BrandsAdmin() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(init);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminGetBrands({ q, limit: 50 });
      setList(data?.data || data); // paginate hoặc array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // load đầu

  const onChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : (files ? files[0] : value),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form };
    try {
      if (editing) await adminUpdateBrand(editing.id, payload);
      else await adminCreateBrand(payload);
      setForm(init); setEditing(null);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Lưu thương hiệu thất bại");
    }
  };

  const edit = (b) => {
    setEditing(b);
    setForm({ ...init, ...b, logo: null }); // không bind file cũ
  };

  const del = async (id) => {
    if (!confirm("Xoá thương hiệu?")) return;
    await adminDeleteBrand(id);
    await load();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Thương hiệu</h1>
        <div className="flex gap-2">
          <input
            placeholder="Tìm theo tên/slug..."
            className="border rounded p-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={load} className="px-3 py-2 rounded bg-black text-white">Tìm</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={submit} className="border rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-medium">{editing ? "Sửa thương hiệu" : "Thêm thương hiệu"}</h2>
            {editing && (
              <button
                type="button"
                className="text-sm underline"
                onClick={() => { setEditing(null); setForm(init); }}
              >Tạo mới</button>
            )}
          </div>

          <input name="name" value={form.name} onChange={onChange} placeholder="Tên *" className="border rounded w-full p-2" required />
          <input name="slug" value={form.slug} onChange={onChange} placeholder="Slug (tự sinh nếu để trống)" className="border rounded w-full p-2" />
          <textarea name="description" value={form.description} onChange={onChange} placeholder="Mô tả" className="border rounded w-full p-2" rows={3} />
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} />
              Kích hoạt
            </label>
            <input type="number" name="sort_order" value={form.sort_order} onChange={onChange} placeholder="Thứ tự" className="border rounded p-2 w-32" />
          </div>
          <div>
            <label className="block text-sm mb-1">Logo (PNG/JPG ≤ 2MB)</label>
            <input type="file" name="logo" onChange={onChange} accept="image/*" />
            {editing?.logo && (
              <div className="mt-2">
                <img src={preview(editing.logo)} alt="" className="h-10 object-contain" />
              </div>
            )}
          </div>

          <button className="rounded bg-black text-white px-4 py-2">{editing ? "Cập nhật" : "Thêm mới"}</button>
        </form>

        {/* List */}
        <div className="border rounded-xl p-4">
          <h2 className="font-medium mb-3">Danh sách</h2>
          {loading ? "Đang tải..." : (
            <div className="space-y-2">
              {list.map((b) => (
                <div key={b.id} className="flex items-center justify-between border rounded p-2">
                  <div className="flex items-center gap-3">
                    {b.logo && <img src={preview(b.logo)} className="h-8 w-8 object-contain" />}
                    <div>
                      <div className="font-medium">{b.name}</div>
                      <div className="text-xs text-gray-500">{b.slug}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border rounded" onClick={() => edit(b)}>Sửa</button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => del(b.id)}>Xoá</button>
                  </div>
                </div>
              ))}
              {list.length === 0 && <div className="text-sm text-gray-500">Không có dữ liệu</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function preview(pathOrUrl = "") {
  if (!pathOrUrl) return "";
  // Nếu BE lưu storage/public => trả về /storage/brands/...
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${import.meta.env.VITE_API_URL?.replace(/\/api$/, "") || "http://127.0.0.1:8000"}/${pathOrUrl.startsWith("storage") ? pathOrUrl : "storage/" + pathOrUrl}`;
}
