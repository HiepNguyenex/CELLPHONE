// src/components/product/InstallmentBox.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { getInstallments, quoteInstallment } from "../../services/api";

const METHOD_LABEL = { credit: "Trả góp qua thẻ", finance: "Công ty tài chính" };

export default function InstallmentBox({ price = 0, onApply }) {
  const [plans, setPlans] = useState({ credit: [], finance: [] });
  const [method, setMethod] = useState("credit");
  const [months, setMonths] = useState(12);
  const [downPercent, setDownPercent] = useState(0);
  const [zeroPercent, setZeroPercent] = useState(true);
  const [provider, setProvider] = useState("auto"); // ✅ thêm

  const [loading, setLoading] = useState(true);
  const [quoting, setQuoting] = useState(false);
  const [quote, setQuote] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const onApplyRef = useRef(onApply);
  useEffect(() => { onApplyRef.current = onApply; }, [onApply]);

  // Load plans
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    getInstallments({}, ac.signal)
      .then((res) => {
        const data = res?.data?.data || {};
        const credit = Array.isArray(data.credit) ? data.credit : [];
        const finance = Array.isArray(data.finance) ? data.finance : [];
        setPlans({ credit, finance });

        const firstMethod = credit.length ? "credit" : (finance.length ? "finance" : "credit");
        setMethod(firstMethod);
        const firstMonths = (firstMethod === "credit" ? credit : finance)[0]?.months || 12;
        setMonths(firstMonths);

        if (firstMethod === "credit") {
          const has0 = credit.some(p => p.months === firstMonths && p.zero_percent);
          setZeroPercent(has0);
        } else setZeroPercent(false);
      })
      .catch((e) => {
        if (e?.name !== "CanceledError") console.error("Load installments:", e);
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  const methodPlans = useMemo(
    () => (method === "credit" ? plans.credit : plans.finance),
    [plans, method]
  );

  const monthOptions = useMemo(
    () => Array.from(new Set(methodPlans.map((p) => p.months))).sort((a,b)=>a-b),
    [methodPlans]
  );

  // Các plan cùng months hiện tại
  const sameMonthPlans = useMemo(
    () => methodPlans.filter(p => p.months === months),
    [methodPlans, months]
  );

  // Min % trả trước theo months
  const minDown = useMemo(() => {
    if (!sameMonthPlans.length) return 0;
    return Math.min(...sameMonthPlans.map(p => Number(p.min_down_percent || 0)));
  }, [sameMonthPlans]);

  // Danh sách provider cho months hiện tại
  const providerOptions = useMemo(() => {
    const set = new Set(sameMonthPlans.map(p => (p.provider || "").trim()).filter(Boolean));
    return Array.from(set);
  }, [sameMonthPlans]);

  const zeroAvailable = useMemo(() => {
    if (method !== "credit") return false;
    return sameMonthPlans.some(p => p.zero_percent);
  }, [method, sameMonthPlans]);

  // Kẹp down theo minDown
  useEffect(() => {
    setDownPercent((d) => Math.max(minDown, Math.min(70, d)));
  }, [minDown]);

  // Khi đổi method/months → reset provider hợp lý
  useEffect(() => {
    if (!providerOptions.length) setProvider("auto");
    else if (provider !== "auto" && !providerOptions.includes(provider)) {
      setProvider("auto");
    }
  }, [providerOptions]); // eslint-disable-line

  // Nếu method ≠ credit hoặc months không có 0% → tắt zero
  useEffect(() => {
    if (method !== "credit") setZeroPercent(false);
    else if (!zeroAvailable) setZeroPercent(false);
  }, [method, zeroAvailable]);

  // Gọi quote
  useEffect(() => {
    setErrMsg("");
    if (!price || !methodPlans.length) { setQuote(null); return; }

    const payload = {
      price: Number(price),
      method,
      months: Number(months),
      down_percent: Math.max(minDown, Number(downPercent)), // ✅ kẹp để tránh 422
      zero_percent: !!zeroPercent,
      provider: provider !== "auto" ? provider : undefined,   // ✅ truyền provider nếu có chọn
    };

    const ac = new AbortController();
    setQuoting(true);
    quoteInstallment(payload, ac.signal)
      .then((res) => {
        setQuote(res?.data?.quote || null);
        if (!res?.data?.status) setErrMsg(res?.data?.message || "");
      })
      .catch((e) => {
        if (e?.response?.status === 422) setErrMsg(e?.response?.data?.message || "Không có gói phù hợp");
        else if (e?.name !== "CanceledError") console.error(e);
        setQuote(null);
      })
      .finally(() => setQuoting(false));
    return () => ac.abort();
  }, [price, method, months, downPercent, zeroPercent, provider, methodPlans.length, minDown]);

  if (loading) {
    return <div className="mt-4 border rounded-lg p-4 text-gray-600">Đang tải cấu hình trả góp…</div>;
  }

  if (!plans.credit.length && !plans.finance.length) {
    return <div className="mt-4 border rounded-lg p-4 text-gray-600">Sản phẩm này hiện chưa có cấu hình trả góp phù hợp.</div>;
  }

  return (
    <div className="mt-4 border rounded-lg">
      <div className="px-4 py-3 font-semibold border-b">Trả góp & tính tiền/tháng</div>

      <div className="p-4 space-y-3">
        {/* Chọn phương thức */}
        <div className="flex flex-wrap items-center gap-6">
          {["credit","finance"].map(m => (
            <label key={m} className={`inline-flex items-center gap-2 ${!plans[m]?.length ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
              <input type="radio" name="method" disabled={!plans[m]?.length} checked={method === m} onChange={() => plans[m]?.length && setMethod(m)} />
              {METHOD_LABEL[m]}
            </label>
          ))}

          {method === "credit" && (
            <label className={`inline-flex items-center gap-2 ml-auto ${!zeroAvailable ? "opacity-50" : ""}`}>
              <input type="checkbox" disabled={!zeroAvailable} checked={!!zeroPercent} onChange={(e) => setZeroPercent(e.target.checked)} />
              0% lãi suất
            </label>
          )}
        </div>

        {/* Provider (nếu có nhiều) */}
        {providerOptions.length > 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <div className="text-sm text-gray-600 mb-1">Đối tác</div>
              <select className="w-full border rounded px-3 py-2" value={provider} onChange={(e)=>setProvider(e.target.value)}>
                <option value="auto">Tự động (tốt nhất)</option>
                {providerOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        ) : (providerOptions.length === 1 && (
          <div className="text-sm text-gray-600">Đối tác: <span className="font-medium">{providerOptions[0]}</span></div>
        ))}

        {/* Kỳ hạn & Trả trước */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
          <div className="sm:col-span-1">
            <div className="text-sm text-gray-600 mb-1">Kỳ hạn</div>
            <select className="w-full border rounded px-3 py-2" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
              {monthOptions.map(m => <option key={m} value={m}>{m} tháng</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Trả trước</span><span>{downPercent}%</span>
            </div>
            <input type="range" min={minDown} max={70} step={1} value={downPercent} onChange={(e)=>setDownPercent(Number(e.target.value))} className="w-full" />
            <div className="text-xs text-gray-500">Tối thiểu {minDown}% (theo cấu hình)</div>
          </div>
        </div>

        {/* Ước tính */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2">
            <div className="text-sm text-gray-600 mb-1">Ước tính/tháng</div>
            <div className="border rounded px-3 py-3 bg-gray-50 font-semibold text-red-600 text-lg">
              {quoting || !quote ? "—" : `${Number(quote.monthly || 0).toLocaleString("vi-VN")} ₫`}
            </div>
            {quote && (
              <div className="text-xs text-gray-500 mt-1">
                Tổng trả: {Number(quote.total_payable || 0).toLocaleString("vi-VN")} ₫ · Kỳ hạn: {quote.months} tháng
              </div>
            )}
            {!!errMsg && <div className="text-xs text-red-600 mt-1">{errMsg}</div>}
          </div>

          <button
            onClick={() => onApplyRef.current?.({ method, months, down_percent: Math.max(minDown, downPercent), zero_percent: zeroPercent, provider: provider !== "auto" ? provider : undefined, quote })}
            className="h-11 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            Đăng ký trả góp
          </button>
        </div>
      </div>
    </div>
  );
}
