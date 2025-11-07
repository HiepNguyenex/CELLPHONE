// === FILE: src/admin/FlashSalesAdmin.jsx (ĐÃ BỔ SUNG TRƯỜNG ADMIN) ===
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  adminGetFlashSales,
  adminCreateFlashSale,
  adminUpdateFlashSale,
  adminDeleteFlashSale,
} from "../services/api";
import { BoltIcon, PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

// (Đây là một Modal/Form component đơn giản, bạn có thể tách ra file riêng nếu muốn)
function SaleFormModal({ sale, onClose, onSave }) {
  // ✅ Helper: Chuyển ISO (YYYY-MM-DDTHH:mm) sang YYYY-MM-DD HH:MM:SS
  const formatForLaravel = (datetimeLocal) => {
    if (!datetimeLocal) return null;
    return datetimeLocal.replace("T", " ") + ":00";
  };
  
  // ✅ Helper: Chuyển ISO (từ DB) sang YYYY-MM-DDTHH:mm (cho input)
  const formatForInput = (iso) => {
    if (!iso) return "";
    try {
      // Dùng toISOString và cắt chuỗi để đảm bảo đúng múi giờ
      const date = new Date(iso);
      const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      return localISOTime;
    } catch (e) {
      return "";
    }
  };

  const [data, setData] = useState({
    name: "",
    start_time: "",
    end_time: "",
    is_active: true,
    // 🚀 BỔ SUNG: Hai trường mới
    description: "", 
    banner_image_url: "", 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sale) {
      // ✅ CẬP NHẬT: Load dữ liệu từ sale object, bao gồm các trường mới
      setData({
        name: sale.name || "",
        start_time: formatForInput(sale.start_time),
        end_time: formatForInput(sale.end_time),
        is_active: sale.is_active ?? true,
        // 🚀 BỔ SUNG: Load dữ liệu cho các trường mới
        description: sale.description || "",
        banner_image_url: sale.banner_image_url || "",
      });
    }
  }, [sale]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ SỬA LỖI 422: Chuyển đổi định dạng ngày giờ trước khi gửi
      const payload = {
        ...data,
        start_time: formatForLaravel(data.start_time),
        end_time: formatForLaravel(data.end_time),
        // 🚀 ĐẢM BẢO GỬI URL và DESCRIPTION TỚI BACKEND
        description: data.description.trim(),
        banner_image_url: data.banner_image_url.trim() || null, // Cho phép NULL nếu trống
      };
      
      if (sale?.id) {
        await adminUpdateFlashSale(sale.id, payload);
      } else {
        await adminCreateFlashSale(payload);
      }
      onSave(); // Báo cho cha biết để tải lại dữ liệu
      onClose(); // Đóng modal
    } catch (error) {
      console.error("Lỗi lưu Flash Sale:", error);
      // Hiển thị lỗi validation (nếu có)
      if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat().join("\n");
        alert("Lỗi Validation:\n" + errors);
      } else {
        alert("Lỗi: " + error.response?.data?.message || error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
      >
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">
            {sale?.id ? "Sửa sự kiện Flash Sale" : "Tạo sự kiện Flash Sale"}
          </h3>
        </div>
        <div className="p-4 space-y-3">
          
          {/* Trường Tên sự kiện */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên sự kiện</label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Ví dụ: Black Friday Sale"
              required
            />
          </div>

          {/* 🚀 BỔ SUNG: Trường URL Ảnh Banner */}
          <div>
            <label className="block text-sm font-medium text-gray-700">URL Ảnh Banner (Trang chủ)</label>
            <input 
                type="url" 
                name="banner_image_url"
                placeholder="Dán link ảnh banner (https://...)" 
                value={data.banner_image_url} 
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* 🚀 BỔ SUNG: Trường Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả chương trình</label>
            <textarea
                rows="2"
                name="description"
                placeholder="Mô tả ngắn gọn về chương trình (Hiển thị trên Banner)"
                value={data.description} 
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          
          {/* Trường Thời gian bắt đầu */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Thời gian bắt đầu</label>
            <input
              type="datetime-local" // 👈 Input này trả về YYYY-MM-DDTHH:mm
              name="start_time"
              value={data.start_time}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          {/* Trường Thời gian kết thúc */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Thời gian kết thúc</label>
            <input
              type="datetime-local" // 👈 Input này trả về YYYY-MM-DDTHH:mm
              name="end_time"
              value={data.end_time}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={data.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Kích hoạt ngay</label>
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ====== Component Trang Chính (Không đổi) ======
export default function FlashSalesAdmin() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null); // null = tạo mới, object = sửa

  const fetchData = async () => {
    setLoading(true);
    try {
      // ✅ CẦN LƯU Ý: Admin API getFlashSales thường trả về nhiều sale, không chỉ 1
      const res = await adminGetFlashSales();
      setSales(res.data?.data || res.data || []);
    } catch (err) {
      setError("Không thể tải danh sách sự kiện.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (sale = null) => {
    setEditingSale(sale);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
  };

  // Sau khi lưu (tạo/sửa), tải lại data
  const handleSave = () => {
    fetchData();
  };
  
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      try {
        await adminDeleteFlashSale(id);
        fetchData(); // Tải lại
      } catch (err) {
          alert("Lỗi: " + err.response?.data?.message || err.message);
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Quản lý Flash Sale</h1>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          <PlusIcon className="w-5 h-5" />
          Tạo sự kiện mới
        </button>
      </div>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Tên sự kiện</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Bắt đầu</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Kết thúc</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Trạng thái</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-600">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm">{sale.name}</td>
                  <td className="p-3 text-sm">{new Date(sale.start_time).toLocaleString("vi-VN")}</td>
                  <td className="p-3 text-sm">{new Date(sale.end_time).toLocaleString("vi-VN")}</td>
                  <td className="p-3 text-sm">
                    {sale.is_active ? (
                      <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">Kích hoạt</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">Tắt</span>
                    )}
                  </td>
                  <td className="p-3 text-sm flex items-center gap-1">
                    <button
                      onClick={() => handleOpenModal(sale)}
                      className="p-1.5 text-blue-600 hover:bg-gray-100 rounded"
                      title="Sửa"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="p-1.5 text-red-600 hover:bg-gray-100 rounded"
                      title="Xóa"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/admin/flash-sales/${sale.id}/products`} // (Cần tạo trang này sau)
                      className="ml-2 text-sm text-gray-600 hover:underline"
                    >
                      (Quản lý sản phẩm)
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && <p className="p-4 text-center text-gray-500">Chưa có sự kiện Flash Sale nào.</p>}
        </div>
      )}

      {/* Modal để Tạo/Sửa */}
      {isModalOpen && (
        <SaleFormModal
          sale={editingSale}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
}