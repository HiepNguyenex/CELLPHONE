// src/admin/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart, Package, Users, CircleDollarSign,
  ArrowUpRight, ArrowDownRight, CalendarRange, Download
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area,
  CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts";
import { adminGetDashboard } from "../services/api";

const fmtVND = (v) => {
  try { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0); }
  catch { return `${v ?? 0} ₫`; }
};
const shortVND = (v=0) => `${Math.round((v||0)/1_000_000)}tr`;

function StatCard({ icon, label, value, delta }) {
  const isUp = (delta ?? 0) >= 0;
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-gray-500 text-sm">{label}</div>
        <div className="text-2xl font-semibold leading-tight">{value}</div>
        {delta != null && (
          <div className={`mt-1 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border 
              ${isUp ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
            {isUp ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
            {Math.abs(delta).toFixed(1)}%
            <span className="text-gray-500 ml-1">MoM</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const map = {
    pending:   "bg-amber-50 text-amber-700 border-amber-200",
    processing:"bg-sky-50 text-sky-700 border-sky-200",
    shipping:  "bg-indigo-50 text-indigo-700 border-indigo-200",
    shipped:   "bg-indigo-50 text-indigo-700 border-indigo-200",
    paid:      "bg-emerald-50 text-emerald-700 border-emerald-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    canceled:  "bg-rose-50 text-rose-700 border-rose-200",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs ${map[value] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
      {value}
    </span>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [months, setMonths] = useState(6);

  const [summary, setSummary] = useState({ orders:0, products:0, users:0, month_revenue:0 });
  const [series,  setSeries]  = useState([]);   // [{label, revenue, orders?}]
  const [recent,  setRecent]  = useState([]);

  async function load() {
    setLoading(true); setErr("");
    try {
      const res = await adminGetDashboard({ months });
      const d = res?.data || {};
      setSummary(d.summary || {});
      setSeries((d.revenue_by_month || []).map((r, i) => ({
        label: r.label || r.ym || r.month || `${i+1}`,
        revenue: Number(r.revenue ?? 0),
        orders: Number(r.orders ?? 0),
      })));
      setRecent(Array.isArray(d.recent_orders) ? d.recent_orders : []);
    } catch(e) {
      setErr(e?.response?.data?.message || e.message || "Không tải được dashboard");
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{ load(); /* eslint-disable-next-line */}, [months]);

  // Tính MoM cho doanh thu & số đơn
  const { revenueMoM, ordersMoM } = useMemo(() => {
    if (series.length < 2) return { revenueMoM: null, ordersMoM: null };
    const cur  = series[series.length-1];
    const prev = series[series.length-2];
    const r    = prev.revenue ? ((cur.revenue - prev.revenue) / prev.revenue) * 100 : null;
    const o    = prev.orders  ? ((cur.orders  - prev.orders)  / prev.orders ) * 100 : null;
    return { revenueMoM: r, ordersMoM: o };
  }, [series]);

  const aov = useMemo(() => {
    if (!series.length) return null;
    const cur = series[series.length-1];
    return cur.orders ? cur.revenue / cur.orders : null;
  }, [series]);

  const exportCSV = () => {
    const rows = [
      ["ID","Code","Customer","Total","Status","CreatedAt"],
      ...recent.map(o => [o.id, o.code || `#${o.id}`, o.name || "", o.total, o.status, o.created_at || ""])
    ];
    const csv = rows.map(r => r.map(x => `"${(x??"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `recent-orders-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-4 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {Array.from({length:4}).map((_,i)=><div key={i} className="h-24 bg-gray-100 rounded-2xl border" />)}
        </div>
        <div className="h-80 bg-gray-100 rounded-2xl border" />
        <div className="mt-4 h-48 bg-gray-100 rounded-2xl border" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">📊 Dashboard</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-xl px-2 py-1 bg-white">
            <CalendarRange size={16} className="text-gray-500" />
            <button className={`px-2 py-1 rounded-lg ${months===6  ? "bg-red-600 text-white" : "text-gray-700"}`}  onClick={()=>setMonths(6)}>6T</button>
            <button className={`px-2 py-1 rounded-lg ${months===12 ? "bg-red-600 text-white" : "text-gray-700"}`} onClick={()=>setMonths(12)}>12T</button>
            <button className={`px-2 py-1 rounded-lg ${months===24 ? "bg-red-600 text-white" : "text-gray-700"}`} onClick={()=>setMonths(24)}>24T</button>
          </div>
        </div>
      </div>

      {err && <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3 rounded-xl">{err}</div>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingCart className="text-red-600" size={22}/>}
          label="Orders"
          value={summary.orders ?? 0}
          delta={ordersMoM}
        />
        <StatCard
          icon={<Package className="text-green-600" size={22}/>}
          label="Products"
          value={summary.products ?? 0}
        />
        <StatCard
          icon={<Users className="text-blue-600" size={22}/>}
          label="Users"
          value={summary.users ?? 0}
        />
        <StatCard
          icon={<CircleDollarSign className="text-amber-600" size={22}/>}
          label="Doanh thu tháng"
          value={fmtVND(summary.month_revenue || 0)}
          delta={revenueMoM}
        />
      </div>

      {/* Chart */}
      <div className="bg-white border rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-semibold">Doanh thu theo tháng</div>
            <div className="text-gray-500 text-sm">
              {series.length ? `Tổng: ${fmtVND(series.reduce((s,x)=>s+x.revenue,0))}` : "Không có dữ liệu"}
              {aov != null && <span className="ml-2">• AOV: <b>{fmtVND(aov)}</b></span>}
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={shortVND} />
              <Tooltip
                formatter={(v) => [fmtVND(v), "Doanh thu"]}
                labelFormatter={(l) => `Tháng ${l}`}
              />
              <Area type="monotone" dataKey="revenue" stroke="#ef4444" fill="url(#rev)" strokeWidth={2}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white border rounded-2xl shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="font-semibold">Đơn hàng gần đây</div>
          <button onClick={exportCSV} className="inline-flex items-center gap-1 text-sm border rounded-lg px-3 py-1.5 hover:bg-gray-50">
            <Download size={16}/> Export CSV
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3">Mã</th>
                <th className="text-left p-3">Khách hàng</th>
                <th className="text-left p-3">Tổng tiền</th>
                <th className="text-left p-3">Trạng thái</th>
                <th className="text-left p-3">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recent.length ? recent.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="p-3 font-medium">{o.code || `#${o.id}`}</td>
                  <td className="p-3">{o.name || "—"}</td>
                  <td className="p-3 text-red-600">{fmtVND(o.total)}</td>
                  <td className="p-3"><StatusBadge value={(o.status||"").toLowerCase()} /></td>
                  <td className="p-3">
                    {o.created_at ? new Date(o.created_at).toLocaleString("vi-VN") : "—"}
                  </td>
                </tr>
              )) : (
                <tr><td className="p-6 text-center text-gray-500" colSpan={5}>Chưa có đơn nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
