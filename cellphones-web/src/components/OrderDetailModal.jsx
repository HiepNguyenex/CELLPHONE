// ==== ORDER DETAIL MODAL ====
function OrderDetailModal({ open, onClose, order, onAskDelete }) {
  if (!order) return null;

  // 👇 HÀM TẢI PDF HOÁ ĐƠN (đặt trong component để dùng thẳng props `order`)
  async function downloadInvoice() {
    try {
      const res = await adminDownloadInvoice(order.id);
      const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order.code || order.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Tải hoá đơn thất bại");
    }
  }

  const copyAddr = () => navigator.clipboard?.writeText(order.address || "");

  const totals = [
    { k: "Tạm tính", v: order.subtotal },
    { k: "Phí vận chuyển", v: order.shipping },
    { k: "Giảm giá", v: -Math.abs(order.discount || 0) },
    { k: "Tổng tiền", v: order.total, strong: true },
  ];

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <Dialog.Title className="text-xl font-semibold">
                  Đơn #{order.id}
                </Dialog.Title>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      STATUS_BADGE[order.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    Tạo lúc: {fmt(order.created_at)}
                  </span>
                </div>
              </div>

              {/* 👉 Các nút action trên header */}
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadInvoice}
                  className="px-3 py-2 rounded border hover:bg-gray-50"
                  title="Tải PDF"
                >
                  Tải PDF
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 rounded border hover:bg-gray-50 flex items-center gap-2"
                  title="In hóa đơn"
                >
                  <Printer size={16} /> In hóa đơn
                </button>
                <button
                  disabled={!["pending","canceled"].includes(order.status)}
                  onClick={onAskDelete}
                  className={`px-3 py-2 rounded border ${
                    ["pending","canceled"].includes(order.status)
                      ? "text-red-600 border-red-200 hover:bg-red-50"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                  title="Xóa đơn"
                >
                  Xóa đơn
                </button>
                <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Nội dung chi tiết đơn (giữ nguyên như bạn đang có) */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2 font-medium">
                    <User size={16} /> Khách hàng
                  </div>
                  <Line label="Họ tên" icon={User}>{order.name}</Line>
                  <Line label="Email" icon={Mail}>{order.email}</Line>
                  <Line label="Điện thoại" icon={Phone}>{order.phone}</Line>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2 font-medium">
                    <MapPin size={16} /> Địa chỉ giao hàng
                  </div>
                  <div className="text-sm">{order.address || "—"}</div>
                  <button
                    onClick={copyAddr}
                    className="mt-2 inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"
                  >
                    <Copy size={14} /> Sao chép
                  </button>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2 font-medium">
                    <DollarSign size={16} /> Thanh toán & vận chuyển
                  </div>
                  <Line label="Thanh toán">{order.payment_method || "—"}</Line>
                  <Line label="Vận chuyển" icon={Truck}>
                    {order.shipping_method || "—"}
                  </Line>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b font-medium flex items-center gap-2">
                    <Package size={16} /> Sản phẩm
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-left">Sản phẩm</th>
                        <th className="p-3 text-center w-20">SL</th>
                        <th className="p-3 text-right w-32">Đơn giá</th>
                        <th className="p-3 text-right w-32">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((it) => (
                        <tr key={it.id} className="border-t">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  it.image_url ||
                                  "https://dummyimage.com/48x48/eeeeee/000000&text=IMG"
                                }
                                alt={it.name}
                                className="w-12 h-12 rounded object-cover"
                              />
                              <div>
                                <div className="font-medium">{it.name}</div>
                                <div className="text-xs text-gray-500">
                                  #{it.product_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">{it.qty}</td>
                          <td className="p-3 text-right">{money(it.price)}</td>
                          <td className="p-3 text-right">{money(it.price * it.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="w-full md:w-80 border rounded-lg ml-auto">
                  <div className="px-4 py-3 border-b font-medium">Tổng tiền</div>
                  <div className="p-4 space-y-2">
                    {totals.map((t) => (
                      <div
                        key={t.k}
                        className={`flex justify-between ${
                          t.strong ? "text-base font-semibold" : "text-sm"
                        }`}
                      >
                        <span>{t.k}</span>
                        <span className={t.strong ? "text-red-600" : ""}>
                          {money(t.v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
