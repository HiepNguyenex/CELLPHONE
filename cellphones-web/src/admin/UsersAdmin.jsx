// src/admin/UsersAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Search, Shield, ShieldOff, LogOut, Ban, CheckCircle2,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  MoreVertical, Filter, Download, UserRound
} from "lucide-react";
import {
  adminGetUsers, adminGetUser, adminUpdateUser,
  adminBanUser, adminUnbanUser, adminLogoutAllUser
} from "../services/api";

// ===== Helpers =====
const money = (v) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v || 0);
const fmtDate = (s) => (s ? new Date(s).toLocaleString("vi-VN") : "—");
const cx = (...a) => a.filter(Boolean).join(" ");
const useDebounced = (val, ms=400) => {
  const [v, setV] = useState(val);
  useEffect(() => { const t = setTimeout(()=>setV(val), ms); return () => clearTimeout(t); }, [val, ms]);
  return v;
};

// ===== Tiny UI atoms (no libs) =====
function Badge({ children, className }) {
  return <span className={cx("inline-flex items-center px-2 py-0.5 rounded-full border text-xs", className)}>{children}</span>;
}
function Button({ children, className, ...rest }) {
  return <button className={cx("inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition", className)} {...rest}>{children}</button>;
}
function SolidButton({ children, className, ...rest }) {
  return <button className={cx("inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black text-white hover:opacity-90 transition", className)} {...rest}>{children}</button>;
}
function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="px-4 py-3 border-t flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
function Toast({ msg, type="success", onClose }) {
  if (!msg) return null;
  const map = type==="error"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <div className={cx("fixed right-4 bottom-4 z-50 border rounded-xl px-3 py-2 shadow", map)}>
      <div className="flex items-center gap-2">
        {type==="error" ? <Ban size={16}/> : <CheckCircle2 size={16}/>}
        <span className="text-sm">{msg}</span>
        <button className="ml-2 text-xs underline" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}

function StatusChip({ status }) {
  const map = {
    active:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    banned:  "bg-rose-50 text-rose-700 border-rose-200",
  };
  return <Badge className={map[status] || "bg-gray-50 text-gray-700 border-gray-200"}>{status || "—"}</Badge>;
}
function RoleChip({ role }) {
  const map = {
    admin: "bg-indigo-50 text-indigo-700 border-indigo-200",
    staff: "bg-amber-50 text-amber-700 border-amber-200",
    user:  "bg-gray-50 text-gray-700 border-gray-200",
  };
  return <Badge className={map[role] || map.user}>{role || "user"}</Badge>;
}
function Avatar({ name, email }) {
  const ini = (name || email || "?").trim().slice(0,1).toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-red-500 to-rose-400 text-white flex items-center justify-center text-sm font-semibold">
      {ini}
    </div>
  );
}

export default function UsersAdmin() {
  // ===== State =====
  const [rows,setRows] = useState([]);
  const [q,setQ] = useState("");
  const [role,setRole] = useState("");
  const [status,setStatus] = useState("");
  const [sort,setSort] = useState("created_at");
  const [order,setOrder] = useState("desc");
  const [page,setPage] = useState(1);
  const [perPage,setPerPage] = useState(10);
  const [total,setTotal] = useState(0);
  const [loading,setLoading] = useState(true);
  const [detail,setDetail] = useState(null);

  const [toast, setToast] = useState({msg:"", type:"success"});
  const [confirm, setConfirm] = useState({open:false, action:null, label:""});
  const [menuOpenId, setMenuOpenId] = useState(null);

  const [selected, setSelected] = useState(new Set());
  const allChecked = rows.length>0 && rows.every(r => selected.has(r.id));
  const debouncedQ = useDebounced(q, 450);

  // ===== Data load =====
  async function load() {
    setLoading(true);
    try {
      const res = await adminGetUsers({ q: debouncedQ, role, status, sort, order, page, perPage });
      const data = res.data;
      setRows(data.data || []);
      setTotal(data.total || data.meta?.total || 0);
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{ load(); /* eslint-disable-next-line */}, [debouncedQ, role, status, sort, order, page, perPage]);

  // ===== Actions =====
  function ask(label, action) {
    setConfirm({ open:true, action, label });
  }
  async function doAction(fn, okMsg="Đã thực hiện.") {
    try { await fn(); setToast({msg:okMsg, type:"success"}); load(); }
    catch(e){ setToast({msg: e?.response?.data?.message || e.message || "Thao tác thất bại", type:"error"}); }
    finally { setConfirm({open:false, action:null, label:""}); }
  }
  async function toggleBan(u) {
    await doAction(() => (u.status==="banned" ? adminUnbanUser(u.id) : adminBanUser(u.id)),
      u.status==="banned" ? "Đã unban." : "Đã ban user.");
  }
  async function toggleRole(u) {
    const next = u.role === "admin" ? "user" : "admin";
    await doAction(() => adminUpdateUser(u.id, { role: next }),
      next==="admin" ? "Đã set admin." : "Đã bỏ admin.");
  }
  async function revoke(u) {
    await doAction(() => adminLogoutAllUser(u.id), "Đã revoke mọi phiên đăng nhập.");
  }
  async function openDetail(u) {
    const res = await adminGetUser(u.id);
    setDetail(res.data);
  }

  // Bulk
  const selectedIds = useMemo(()=>Array.from(selected), [selected]);
  const hasSelection = selectedIds.length > 0;
  async function bulk(fnName) {
    if (!hasSelection) return;
    await doAction(async ()=> {
      for (const id of selectedIds) {
        if (fnName==="ban") await adminBanUser(id);
        if (fnName==="unban") await adminUnbanUser(id);
        if (fnName==="setAdmin") await adminUpdateUser(id, { role:"admin" });
        if (fnName==="setUser") await adminUpdateUser(id, { role:"user" });
      }
      setSelected(new Set());
    }, "Đã áp dụng cho mục đã chọn.");
  }

  // Export CSV (filtered or selected)
  function exportCSV(onlySelected=false) {
    const data = onlySelected ? rows.filter(r=>selected.has(r.id)) : rows;
    const rowsCSV = [
      ["ID","Name","Email","Role","Status","Orders","TotalSpent","CreatedAt"],
      ...data.map(u => [u.id, u.name, u.email, u.role||"user", u.status||"active", u.orders_count||0, u.total_spent||0, u.created_at||""])
    ];
    const csv = rowsCSV.map(r => r.map(x => `"${(x??"").toString().replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `users-${onlySelected?"selected-":""}${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  }

  // ===== UI =====
  function SortHeader({ field, children }) {
    const active = sort===field;
    const Icon = order==="asc" ? ChevronUp : ChevronDown;
    return (
      <button
        onClick={()=>{
          if (sort!==field) { setSort(field); setOrder("asc"); }
          else setOrder(o=>o==="asc"?"desc":"asc");
        }}
        className="inline-flex items-center gap-1 hover:underline"
        title="Sắp xếp"
      >
        {children}
        <span className={cx("opacity-40", active ? "opacity-100" : "opacity-30")}>
          <Icon size={14}/>
        </span>
      </button>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Người dùng</h1>
        <div className="flex items-center gap-2">
          <Button onClick={()=>exportCSV(false)}><Download size={16}/> Export (trang)</Button>
          <Button onClick={()=>exportCSV(true)} disabled={!hasSelection} className={cx(!hasSelection && "opacity-50 cursor-not-allowed")}><Download size={16}/> Export (đã chọn)</Button>
          {hasSelection && <span className="text-sm text-gray-500">Đã chọn: {selectedIds.length}</span>}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="border rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Tìm tên hoặc email…"
              value={q}
              onChange={e=>{ setPage(1); setQ(e.target.value); }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 border rounded-xl px-3 py-1.5">
              <Filter size={16} className="text-gray-500"/>
              <select className="outline-none" value={role} onChange={e=>{setPage(1); setRole(e.target.value);}}>
                <option value="">Role: All</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
              <div className="w-px h-5 bg-gray-200" />
              <select className="outline-none" value={status} onChange={e=>{setPage(1); setStatus(e.target.value);}}>
                <option value="">Status: All</option>
                <option value="active">Active</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            <div className="inline-flex items-center gap-2 border rounded-xl px-3 py-1.5">
              <span className="text-sm text-gray-500">Per page</span>
              <select className="outline-none" value={perPage} onChange={e=>{setPage(1); setPerPage(Number(e.target.value));}}>
                {[10,20,50].map(n=><option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          {/* Bulk actions */}
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={()=>ask(`Ban ${selectedIds.length} user?`, ()=>bulk("ban"))}  disabled={!hasSelection} className={!hasSelection ? "opacity-50 cursor-not-allowed" : ""}><Ban size={14}/> Ban</Button>
            <Button onClick={()=>ask(`Unban ${selectedIds.length} user?`, ()=>bulk("unban"))} disabled={!hasSelection} className={!hasSelection ? "opacity-50 cursor-not-allowed" : ""}><CheckCircle2 size={14}/> Unban</Button>
            <Button onClick={()=>ask(`Set admin cho ${selectedIds.length} user?`, ()=>bulk("setAdmin"))} disabled={!hasSelection} className={!hasSelection ? "opacity-50 cursor-not-allowed" : ""}><Shield size={14}/> Set admin</Button>
            <Button onClick={()=>ask(`Set user cho ${selectedIds.length} user?`, ()=>bulk("setUser"))} disabled={!hasSelection} className={!hasSelection ? "opacity-50 cursor-not-allowed" : ""}><ShieldOff size={14}/> Set user</Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50 border-b">
              <tr>
                <th className="p-3 w-10">
                  <input type="checkbox" checked={allChecked}
                    onChange={(e)=>{
                      if (e.target.checked) setSelected(new Set(rows.map(r=>r.id)));
                      else setSelected(new Set());
                    }}/>
                </th>
                <th className="p-3 text-left">Người dùng</th>
                <th className="p-3 text-left"><SortHeader field="email">Email</SortHeader></th>
                <th className="p-3 text-left"><SortHeader field="role">Role</SortHeader></th>
                <th className="p-3 text-left"><SortHeader field="status">Status</SortHeader></th>
                <th className="p-3 text-right"><SortHeader field="orders_count">Orders</SortHeader></th>
                <th className="p-3 text-right"><SortHeader field="total_spent">Total Spent</SortHeader></th>
                <th className="p-3 text-left"><SortHeader field="created_at">Created</SortHeader></th>
                <th className="p-3 text-right w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({length:8}).map((_,i)=>(
                  <tr key={i} className="animate-pulse">
                    <td className="p-3"><div className="h-4 w-4 bg-gray-100 rounded"/></td>
                    <td className="p-3"><div className="h-4 w-48 bg-gray-100 rounded"/></td>
                    <td className="p-3"><div className="h-4 w-40 bg-gray-100 rounded"/></td>
                    <td className="p-3"><div className="h-4 w-20 bg-gray-100 rounded"/></td>
                    <td className="p-3"><div className="h-4 w-20 bg-gray-100 rounded"/></td>
                    <td className="p-3 text-right"><div className="h-4 w-10 bg-gray-100 rounded ml-auto"/></td>
                    <td className="p-3 text-right"><div className="h-4 w-16 bg-gray-100 rounded ml-auto"/></td>
                    <td className="p-3"><div className="h-4 w-28 bg-gray-100 rounded"/></td>
                    <td className="p-3"/>
                  </tr>
                ))
              ) : rows.length ? rows.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <input type="checkbox" checked={selected.has(u.id)}
                      onChange={(e)=>{
                        const s = new Set(selected);
                        if (e.target.checked) s.add(u.id); else s.delete(u.id);
                        setSelected(s);
                      }}/>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} email={u.email}/>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {u.name || "—"}
                          {u.role==="admin" && <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">Admin</Badge>}
                        </div>
                        <div className="text-gray-500">{u.id ? `#${u.id}` : ""}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3"><RoleChip role={u.role || "user"} /></td>
                  <td className="p-3"><StatusChip status={u.status || "active"} /></td>
                  <td className="p-3 text-right">{u.orders_count ?? 0}</td>
                  <td className="p-3 text-right">{money(u.total_spent || 0)}</td>
                  <td className="p-3">{fmtDate(u.created_at)}</td>
                  <td className="p-3 text-right">
                    <div className="relative inline-block">
                      <Button className="px-2 py-1" onClick={()=>setMenuOpenId(id => id===u.id ? null : u.id)}>
                        <MoreVertical size={16}/>
                      </Button>
                      {menuOpenId===u.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border rounded-xl shadow-lg z-20">
                          <button className="w-full text-left px-3 py-2 hover:bg-gray-50" onClick={()=>openDetail(u)}>Chi tiết</button>
                          <button className="w-full text-left px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2" onClick={()=>ask(u.role==="admin"?"Bỏ admin người này?":"Set admin người này?", ()=>toggleRole(u))}>
                            {u.role==="admin" ? <ShieldOff size={14}/> : <Shield size={14}/>}
                            {u.role==="admin" ? "Bỏ admin" : "Set admin"}
                          </button>
                          <button className="w-full text-left px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2" onClick={()=>ask(u.status==="banned"?"Unban người này?":"Ban người này?", ()=>toggleBan(u))}>
                            {u.status==="banned" ? <CheckCircle2 size={14}/> : <Ban size={14}/>}
                            {u.status==="banned" ? "Unban" : "Ban"}
                          </button>
                          <button className="w-full text-left px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2" onClick={()=>ask("Revoke tất cả phiên đăng nhập?", ()=>revoke(u))}>
                            <LogOut size={14}/> Logout All
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={9} className="p-10">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <UserRound />
                      </div>
                      <div className="font-medium">Không tìm thấy người dùng</div>
                      <div className="text-sm">Hãy thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-3 border-t flex items-center gap-2">
          <Button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className={page<=1 && "opacity-50 cursor-not-allowed"}>
            <ChevronLeft size={16}/> Prev
          </Button>
          <span className="px-2 text-sm">Page {page}</span>
          <Button onClick={()=>setPage(p=>p+1)} disabled={rows.length < perPage} className={rows.length < perPage && "opacity-50 cursor-not-allowed"}>
            Next <ChevronRight size={16}/>
          </Button>
          <span className="ml-auto text-gray-500 text-sm">Total ~ {total}</span>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!detail}
        onClose={()=>setDetail(null)}
        title="Thông tin người dùng"
        footer={<SolidButton onClick={()=>setDetail(null)}>Đóng</SolidButton>}
      >
        {detail && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-gray-500">ID</div><div className="font-medium">{detail.id}</div></div>
            <div><div className="text-gray-500">Tạo lúc</div><div className="font-medium">{fmtDate(detail.created_at)}</div></div>
            <div><div className="text-gray-500">Tên</div><div className="font-medium">{detail.name}</div></div>
            <div><div className="text-gray-500">Email</div><div className="font-medium">{detail.email}</div></div>
            <div><div className="text-gray-500">Role</div><div className="font-medium"><RoleChip role={detail.role}/></div></div>
            <div><div className="text-gray-500">Status</div><div className="font-medium"><StatusChip status={detail.status}/></div></div>
            <div><div className="text-gray-500">Orders</div><div className="font-medium">{detail.orders_count ?? 0}</div></div>
            <div><div className="text-gray-500">Total spent</div><div className="font-medium">{money(detail.total_spent || 0)}</div></div>
          </div>
        )}
      </Modal>

      {/* Confirm */}
      <Modal
        open={confirm.open}
        onClose={()=>setConfirm({open:false, action:null, label:""})}
        title="Xác nhận thao tác"
        footer={
          <>
            <Button onClick={()=>setConfirm({open:false, action:null, label:""})}>Huỷ</Button>
            <SolidButton onClick={()=>confirm.action && confirm.action()}>Đồng ý</SolidButton>
          </>
        }
      >
        <div className="text-sm">{confirm.label || "Bạn có chắc không?"}</div>
      </Modal>

      <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast({msg:"", type:"success"})}/>
    </div>
  );
}
