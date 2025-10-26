// Format số tiền về chuẩn VND: 32.990.000 ₫
export const toVND = (value) => {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return "0 ₫";
  return n.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0, // bỏ .00
  });
};
