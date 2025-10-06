export default function Topbar() {
  return (
    <div className="bg-red-700 text-white text-xs">
      <div className="max-w-7xl mx-auto flex justify-between px-4 py-2">
        {/* Bên trái */}
        <div className="flex gap-4">
          <span>Sản phẩm Chính hãng - Xuất VAT đầy đủ</span>
          <span>Giao nhanh - Miễn phí đơn trên 300k</span>
          <span>Đổi trả dễ dàng - Lên đời tiết kiệm</span>
        </div>

        {/* Bên phải */}
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Cửa hàng gần bạn</a>
          <a href="#" className="hover:underline">Tra cứu đơn hàng</a>
          <a href="tel:18002097" className="font-bold">1800 2097</a>
        </div>
      </div>
    </div>
  );
}
