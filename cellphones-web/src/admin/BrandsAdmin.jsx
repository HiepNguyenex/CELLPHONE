import { useEffect, useState } from "react";
import {
  adminGetBrands,
  adminCreateBrand,
  adminUpdateBrand,
  adminDeleteBrand,
} from "../services/api";

// Chuẩn hoá ORIGIN từ VITE_API_URL (/api hoặc /api/v1 đều ok)
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const ORIGIN = (() => {
  try { return new URL(API_BASE, window.location.origin).origin; }
  catch { return API_BASE.replace(/\/api(?:\/v\d+)?\/?$/i,"").replace(/\/+$/,""); }
})();
const buildImg = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const path = String(u).replace(/^\/+/, "");
  const rel  = path.startsWith("storage/") ? path : `storage/${path}`;
  return `${ORIGIN}/${rel}`;
};

const init = {
  name: "", slug: "", description: "",
  is_active: true, sort_order: 0,
  logo: null,         // File
  logoUrl: "",        // URL ngoài
  preview: "",        // ảnh hiển thị
};

export default function BrandsAdmin() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(init);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  const load = async (p = page) => {
    setLoading(true);
    try {
      const { data } = await adminGetBrands({ q, limit: 15, page: p });
      const rows = data?.data ?? data ?? [];
      setList(rows);
      setMeta({
        current_page: data?.current_page ?? 1,
        last_page: data?.last_page ?? 1,
      });
      setPage(data?.current_page ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); /* eslint-disable-next-line */ }, []);

  const onChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((s) => ({
      ...s,
      [name]: files ? files[0] : (type === "checkbox" ? checked : value),
      // nếu chọn file -> xoá URL để tránh nhầm
      ...(files ? { logoUrl: "", preview: URL.createObjectURL(files[0]) } : {}),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description || undefined,
      is_active: form.is_active ? 1 : 0,
      sort_order: form.sort_order ?? 0,
      logo: form.logo ?? undefined,
      logo_url: !form.logo && form.logoUrl ? form.logoUrl : undefined,
    };
    try {
      if (editing) await adminUpdateBrand(editing.id, payload);
      else await adminCreateBrand(payload);
      setForm(init); setEditing(null);
      await load(1);
    } catch (err) {
      alert(err?.response?.data?.message || "Lưu thương hiệu thất bại");
    }
  };

  const edit = (b) => {
    setEditing(b);
    setForm({
      ...init,
      name: b.name || "",
      slug: b.slug || "",
      description: b.description || "",
      is_active: !!b.is_active,
      sort_order: b.sort_order ?? 0,
      preview: b.logo_url ? b.logo_url : buildImg(b.logo),
    });
  };

  const del = async (id) => {
    if (!confirm("Xoá thương hiệu này?")) return;
    await adminDeleteBrand(id);
    await load(page);
  };

  const go = async (p) => { await load(p); };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Thương hiệu</h1>
        <div className="flex gap-2">
          <input
            placeholder="Tìm theo tên/slug…"
            className="border rounded p-2"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={() => load(1)} className="px-3 py-2 rounded border">Tìm</button>
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
          <input name="slug" value={form.slug} onChange={onChange} placeholder="Slug (để trống để tự sinh)" className="border rounded w-full p-2" />
          <textarea name="description" value={form.description} onChange={onChange} placeholder="Mô tả" className="border rounded w-full p-2" rows={3} />
          <div className="flex gap-3 items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} />
              Kích hoạt
            </label>
            <input type="number" name="sort_order" value={form.sort_order} onChange={onChange} placeholder="Thứ tự" className="border rounded p-2 w-28" />
          </div>

          {/* Logo: URL hoặc Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">URL logo (tùy chọn)</label>
              <input
                type="url"
                name="logoUrl"
                value={form.logoUrl}
                onChange={(e) => setForm((s) => ({ ...s, logoUrl: e.target.value, logo: null, preview: e.target.value || s.preview }))}
                placeholder="https://..."
                className="border rounded w-full p-2"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Tải logo (PNG/JPG/WebP ≤ 4MB)</label>
              <input type="file" name="logo" accept="image/*" onChange={onChange} />
            </div>

            {(form.preview || form.logoUrl) && (
              <img
                src={form.logo ? URL.createObjectURL(form.logo) : (form.logoUrl || form.preview)}
                alt="preview"
                className="mt-2 w-20 h-20 object-contain rounded border"
              />
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
                    {(b.logo || b.logo_url) && (
                      <img src={b.logo_url ? b.logo_url : buildImg(b.logo)} className="h-8 w-8 object-contain" />
                    )}
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

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 mt-3">
            <button disabled={page<=1} className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => go(page-1)}>Trước</button>
            <span className="text-sm">Trang {meta.current_page ?? 1}/{meta.last_page ?? 1}</span>
            <button disabled={page>=(meta.last_page ?? 1)} className="px-3 py-1 border rounded disabled:opacity-50" onClick={() => go(page+1)}>Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
