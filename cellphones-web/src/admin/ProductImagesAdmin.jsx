import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  adminGetProductImages,
  adminUploadProductImage,
  adminDeleteProductImage,
  adminReorderProductImages,
  adminSetPrimaryImage,
  adminGetProducts,
} from "../services/api";

export default function ProductImagesAdmin() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);
  const [url, setUrl] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [pRes, imgRes] = await Promise.all([
        adminGetProducts({ ids: id, per_page: 1 }),
        adminGetProductImages(id),
      ]);
      const p = (pRes?.data?.data || [])[0];
      setProduct(p);
      setImages(imgRes?.data?.data || []);
    } catch (e) {
      console.error(e);
      alert("Không tải được dữ liệu ảnh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await adminUploadProductImage(id, file, images.length === 0); // ảnh đầu tiên -> primary
      await load();
      fileRef.current.value = "";
    } catch (e) {
      console.error(e);
      alert("Upload thất bại");
    }
  };

  const onAddByUrl = async () => {
    if (!url.trim()) return;
    try {
      await adminUploadProductImage(id, url.trim(), images.length === 0);
      setUrl("");
      await load();
    } catch (e) {
      console.error(e);
      alert("Thêm URL thất bại");
    }
  };

  const onDelete = async (imageId) => {
    if (!confirm("Xóa ảnh này?")) return;
    try {
      await adminDeleteProductImage(imageId);
      await load();
    } catch (e) {
      console.error(e);
      alert("Không xóa được");
    }
  };

  const onMakePrimary = async (imageId) => {
    try {
      await adminSetPrimaryImage(imageId);
      await load();
    } catch (e) {
      console.error(e);
      alert("Không đặt ảnh chính được");
    }
  };

  // Drag & Drop reorder
  const [dragIndex, setDragIndex] = useState(null);

  const handleDragStart = (idx) => setDragIndex(idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (idx) => {
    if (dragIndex === null || dragIndex === idx) return;
    const arr = [...images];
    const [moved] = arr.splice(dragIndex, 1);
    arr.splice(idx, 0, moved);
    setImages(arr);
    setDragIndex(null);
    try {
      await adminReorderProductImages(id, arr.map((x) => x.id));
    } catch (e) {
      console.error(e);
      alert("Lưu thứ tự thất bại");
      load();
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Quản lý ảnh sản phẩm</h1>
          {product && (
            <div className="text-sm text-gray-600">
              Sản phẩm: <span className="font-medium">{product.name}</span> (ID: {product.id})
              {" • "}
              <Link className="text-blue-600 underline" to={`/product/${product.id}`} target="_blank">Xem trang sản phẩm</Link>
            </div>
          )}
        </div>
        <Link to="/admin/products" className="text-sm text-gray-600 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>

      <div className="grid md:grid-cols-[2fr_1fr] gap-6">
        {/* List ảnh */}
        <div className="bg-white border rounded-lg p-4">
          {images.length === 0 ? (
            <div className="text-gray-600">Chưa có ảnh nào.</div>
          ) : (
            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <li
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  className={`group relative border rounded-md overflow-hidden ${img.is_primary ? "ring-2 ring-red-500" : ""}`}
                  title={`Kéo thả để sắp xếp`}
                >
                  <img src={img.url} alt="" className="w-full h-40 object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/40 text-white text-xs p-1 flex items-center justify-between">
                    <span>{img.is_primary ? "Ảnh chính" : "Ảnh phụ"}</span>
                    <span>#{idx + 1}</span>
                  </div>
                  <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                    {!img.is_primary && (
                      <button
                        className="px-2 py-1 text-xs bg-white/90 rounded hover:bg-white"
                        onClick={() => onMakePrimary(img.id)}
                      >
                        Đặt làm chính
                      </button>
                    )}
                    <button
                      className="px-2 py-1 text-xs bg-white/90 rounded hover:bg-white"
                      onClick={() => onDelete(img.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upload */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium mb-2">Thêm ảnh</h3>
          <div className="space-y-3">
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onUploadFile}
                className="block w-full text-sm"
              />
              <div className="text-xs text-gray-500 mt-1">Tối đa 5MB. Ảnh đầu tiên sẽ tự làm ảnh chính.</div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Hoặc dán URL ảnh..."
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                className="px-3 py-2 bg-gray-800 text-white rounded"
                onClick={onAddByUrl}
              >
                Thêm URL
              </button>
            </div>

            <div className="text-xs text-gray-500">
              Mẹo: có thể kéo thả để **đổi thứ tự**. Nhấn “Đặt làm chính” để đổi ảnh đại diện.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
