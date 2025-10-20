import { useEffect, useMemo, useState } from "react";
import {
  adminGetReviews,
  adminDeleteReview,
  adminBulkReviewDelete,
} from "../services/api"; // chỉnh path nếu file này đặt ở /admin/
import { Link } from "react-router-dom";

export default function AdminReviews() {
  // bộ lọc
  const [q, setQ] = useState("");
  const [rating, setRating] = useState("");
  const [productId, setProductId] = useState("");
  const [userId, setUserId] = useState("");

  // dữ liệu
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, per_page: 20, total: 0 });
  const [loading, setLoading] = useState(false);

  // chọn
  const [selected, setSelected] = useState([]);

  // phân trang
  const page = meta.current_page || 1;
  const perPage = meta.per_page || 20;
  const total = meta.total || 0;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / perPage)),
    [total, perPage]
  );

  const fetchData = (pageNo = 1) => {
    setLoading(true);
    adminGetReviews({
      q: q || undefined,
      rating: rating || undefined,
      product_id: productId || undefined,
      user_id: userId || undefined,
      page: pageNo,
      per_page: perPage,
    })
      .then((res) => {
        const data = res.data;
        setRows(data?.data || []);
        setMeta({
          current_page: data?.current_page ?? 1,
          per_page: data?.per_page ?? 20,
          total: data?.total ?? (data?.data?.length || 0),
        });
        setSelected([]);
      })
      .catch((e) => {
        console.error(e);
        alert("Không tải được danh sách review.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, rating, productId, userId]);

  const toggleAll = (checked) => {
    setSelected(checked ? rows.map((r) => r.id) : []);
  };

  const toggleOne = (id, checked) => {
    setSelected((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)
    );
  };

  const doDelete = async (id) => {
    if (!confirm("Xóa review này?")) return;
    try {
      await adminDeleteReview(id);
      fetchData(page);
    } catch (e) {
      console.error(e);
      alert("Không xóa được review.");
    }
  };

  const doBulkDelete = async () => {
    if (selected.length === 0) return alert("Chưa chọn review nào.");
    if (!confirm(`Xóa ${selected.length} review?`)) return;
    try {
      await adminBulkReviewDelete(selected);
      fetchData(page);
    } catch (e) {
      console.error(e);
      alert("Không xóa hàng loạt được.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý Reviews</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 rounded-lg shadow">
        <input
          className="border rounded px-3 py-2"
          placeholder="Tìm nội dung (q)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="">— Rating —</option>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} sao
            </option>
          ))}
        </select>

        <input
          className="border rounded px-3 py-2"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />

        <input
          className="border rounded px-3 py-2"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />

        <button
          className="bg-blue-600 text-white rounded px-4 py-2"
          onClick={() => fetchData(1)}
        >
          Lọc
        </button>
      </div>

      {/* Bulk actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="px-3 py-2 rounded bg-gray-800 text-white"
          onClick={doBulkDelete}
        >
          Xóa 
        </button>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">
                <input
                  type="checkbox"
                  checked={selected.length > 0 && selected.length === rows.length}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Sản phẩm</th>
              <th className="p-3 text-left">Người dùng</th>
              <th className="p-3 text-left">Rating</th>
              <th className="p-3 text-left">Nội dung</th>
              <th className="p-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-3 text-center" colSpan={7}>
                  Đang tải...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="p-3 text-center" colSpan={7}>
                  Không có review nào.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 align-top">
                    <input
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={(e) => toggleOne(r.id, e.target.checked)}
                    />
                  </td>
                  <td className="p-3 align-top">{r.id}</td>
                  <td className="p-3 align-top">
                    {r.product ? (
                      <>
                        <div className="font-medium">{r.product.name}</div>
                        <div className="text-xs text-gray-500">#{r.product.id}</div>
                        <Link
                          className="text-xs text-blue-600 underline"
                          to={`/product/${r.product_id}`}
                          target="_blank"
                        >
                          Xem trên site
                        </Link>
                      </>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="p-3 align-top">
                    {r.user ? (
                      <>
                        <div className="font-medium">{r.user.name}</div>
                        <div className="text-xs text-gray-500">{r.user.email}</div>
                        <div className="text-xs text-gray-500">#{r.user.id}</div>
                      </>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="p-3 align-top">{r.rating} ⭐</td>
                  <td className="p-3 align-top whitespace-pre-wrap">
                    {r.content || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="p-3 align-top space-x-2">
                    <button
                      className="text-gray-700 hover:underline"
                      onClick={() => doDelete(r.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center gap-2">
        <button
          className="px-3 py-2 rounded border"
          disabled={page <= 1}
          onClick={() => fetchData(page - 1)}
        >
          ← Trước
        </button>
        <div className="text-sm">
          Trang <b>{page}</b> / {totalPages} &nbsp; (Tổng {total})
        </div>
        <button
          className="px-3 py-2 rounded border"
          disabled={page >= totalPages}
          onClick={() => fetchData(page + 1)}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
