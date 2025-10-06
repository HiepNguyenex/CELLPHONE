import { useEffect, useState } from "react";
import { adminGetSettings, adminSaveSettings } from "../services/api";

export default function SettingsAdmin() {
  const [form, setForm] = useState({
    site_name: "",
    support_email: "",
    hotline: "",
    address: "",
    shipping_fee_default: "",
    free_shipping_min: "",
    logo: null, // File
    _logoPreview: "", // URL hiện logo
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminGetSettings();
        const s = res?.data || {};
        setForm(f => ({
          ...f,
          site_name: s.site_name || "",
          support_email: s.support_email || "",
          hotline: s.hotline || "",
          address: s.address || "",
          shipping_fee_default: s.shipping_fee_default || "",
          free_shipping_min: s.free_shipping_min || "",
          _logoPreview: s.logo || "",
        }));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function pickLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm(f => ({
      ...f,
      logo: file,
      _logoPreview: URL.createObjectURL(file),
    }));
  }

  async function onSave() {
    setSaving(true);
    try {
      await adminSaveSettings({
        site_name: form.site_name,
        support_email: form.support_email,
        hotline: form.hotline,
        address: form.address,
        shipping_fee_default: Number(form.shipping_fee_default || 0),
        free_shipping_min: Number(form.free_shipping_min || 0),
        logo: form.logo instanceof File ? form.logo : undefined,
      });
      alert("Đã lưu cài đặt!");
    } catch (e) {
      alert(e?.response?.data?.message || "Lưu cài đặt thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Đang tải cài đặt…</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">⚙️ Cài đặt cửa hàng</h1>

      <div className="bg-white border rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
        <div className="md:col-span-2 space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Tên cửa hàng</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.site_name}
              onChange={(e) => setForm({ ...form, site_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600">Email liên hệ</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={form.support_email}
                onChange={(e) => setForm({ ...form, support_email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Hotline</label>
              <input
                className="border rounded px-3 py-2 w-full"
                value={form.hotline}
                onChange={(e) => setForm({ ...form, hotline: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600">Địa chỉ</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600">Phí vận chuyển mặc định</label>
              <input
                type="number"
                min="0"
                className="border rounded px-3 py-2 w-full"
                value={form.shipping_fee_default}
                onChange={(e) => setForm({ ...form, shipping_fee_default: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">Miễn phí ship từ (đ)</label>
              <input
                type="number"
                min="0"
                className="border rounded px-3 py-2 w-full"
                value={form.free_shipping_min}
                onChange={(e) => setForm({ ...form, free_shipping_min: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onSave}
              disabled={saving}
              className={`px-4 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-black hover:bg-gray-800"}`}
            >
              {saving ? "Đang lưu…" : "Lưu cài đặt"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Logo</label>
          <div className="border rounded-lg p-3 flex items-center gap-3">
            <img
              src={form._logoPreview || "https://dummyimage.com/120x60/efefef/aaa&text=Logo"}
              alt="logo"
              className="w-[120px] h-[60px] object-contain bg-white border rounded"
            />
            <div>
              <label className="inline-block px-3 py-2 border rounded cursor-pointer hover:bg-gray-50">
                Chọn logo
                <input type="file" accept="image/*" className="hidden" onChange={pickLogo} />
              </label>
              <div className="text-xs text-gray-500 mt-1">PNG/JPG/WebP ≤ 2MB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
