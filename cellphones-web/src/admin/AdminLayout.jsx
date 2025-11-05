// === FILE: src/admin/AdminLayout.jsx (ĐÃ NÂNG CẤP) ===
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  CubeIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  TagIcon,
  ChatBubbleLeftRightIcon, // Reviews
  TicketIcon, // Coupons
  BoltIcon, // ✅ MỚI: Flash Sale
  GiftTopIcon, // NEW: Bundles
  BuildingStorefrontIcon, // NEW: Stores
  ClipboardDocumentListIcon, // NEW: Inventories
  ShieldCheckIcon, // NEW: Warranty plans
  CreditCardIcon, // NEW: Installments
} from "@heroicons/react/24/outline";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const itemClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg transition ${
      isActive ? "bg-red-50 text-red-600 font-medium" : "text-gray-700 hover:bg-gray-100"
    }`;

  const SectionLabel = ({ children }) => (
    <div className="text-[11px] uppercase tracking-wide text-gray-400 px-2 mt-3 mb-1">
      {children}
    </div>
  );

  const NavItems = () => (
    <nav className="px-3 py-3 space-y-1">
      <SectionLabel>Quản trị</SectionLabel>

      <NavLink to="/admin" end className={itemClass}>
        <ChartBarIcon className="h-5 w-5 text-gray-600" />
        Bảng điều khiển
      </NavLink>

      <NavLink to="/admin/products" className={itemClass}>
        <CubeIcon className="h-5 w-5 text-gray-600" />
        Sản phẩm
      </NavLink>

      <NavLink to="/admin/categories" className={itemClass}>
        <Squares2X2Icon className="h-5 w-5 text-gray-600" />
        Danh mục
      </NavLink>

      <NavLink to="/admin/brands" className={itemClass}>
        <TagIcon className="h-5 w-5 text-gray-600" />
        Thương hiệu
      </NavLink>

      <NavLink to="/admin/orders" className={itemClass}>
        <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
        Đơn hàng
      </NavLink>

      <NavLink to="/admin/users" className={itemClass}>
        <UsersIcon className="h-5 w-5 text-gray-600" />
        Người dùng
      </NavLink>

      <NavLink to="/admin/reviews" className={itemClass}>
        <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-600" />
        Đánh giá
      </NavLink>

      <NavLink to="/admin/coupons" className={itemClass}>
        <TicketIcon className="h-5 w-5 text-gray-600" />
        Mã giảm giá
      </NavLink>

      {/* ✅ BỔ SUNG MỤC FLASH SALE */}
      <NavLink to="/admin/flash-sales" className={itemClass}>
        <BoltIcon className="h-5 w-5 text-gray-600" />
        Flash Sale
      </NavLink>

      {/* ==== NEW FEATURES group ==== */}
      <SectionLabel>Mở rộng</SectionLabel>

      <NavLink to="/admin/bundles" className={itemClass}>
        <GiftTopIcon className="h-5 w-5 text-gray-600" />
        Combo / Bundles
      </NavLink>

      <NavLink to="/admin/stores" className={itemClass}>
        <BuildingStorefrontIcon className="h-5 w-5 text-gray-600" />
        Cửa hàng
      </NavLink>

      <NavLink to="/admin/inventories" className={itemClass}>
        <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600" />
        Tồn kho cửa hàng
      </NavLink>

      <NavLink to="/admin/warranty-plans" className={itemClass}>
        <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
        Gói bảo hành
      </NavLink>

      <NavLink to="/admin/installments" className={itemClass}>
        <CreditCardIcon className="h-5 w-5 text-gray-600" />
        Cấu hình trả góp
      </NavLink>

      <SectionLabel>Hệ thống</SectionLabel>
      <NavLink to="/admin/settings" className={itemClass}>
        <Cog6ToothIcon className="h-5 w-5 text-gray-600" />
        Cài đặt
      </NavLink>
    </nav>
  );

  const SidebarFooter = () => (
    <div className="mt-auto px-3 py-4 border-t">
      <button
        onClick={logout}
        className="flex items-center gap-2 w-full text-left text-red-600 hover:bg-gray-100 px-3 py-2 rounded-lg"
      >
        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
        Trang chủ
      </button>
      <div className="mt-3 text-[11px] text-gray-400 px-1">Admin Panel • v1.2</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-40 bg-white border-b lg:hidden">
        <div className="h-14 max-w-7xl mx-auto px-4 flex items-center justify-between">
          <button className="p-2 rounded hover:bg-gray-100" onClick={() => setOpen(true)} aria-label="Mở menu">
            <Bars3Icon className="h-6 w-6 text-gray-700" />
          </button>
          <Link to="/admin" className="font-semibold text-red-600">📊 Admin Panel</Link>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:px-6">
        <div className="flex">
          {/* Sidebar – desktop */}
          <aside className="hidden lg:flex lg:sticky lg:top-4 h-[calc(100vh-2rem)] w-72 shrink-0 bg-white border rounded-2xl shadow-sm flex-col mr-6 mt-4">
            <div className="px-5 py-4 border-b">
              <Link to="/admin" className="block">
                <div className="text-xl font-bold text-red-600">Admin Panel</div>
                <div className="text-xs text-gray-500">Quản trị hệ thống</div>
              </Link>
            </div>
            <NavItems />
            <SidebarFooter />
          </aside>

          {/* Mobile drawer */}
          {open && (
            <div className="lg:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
              <aside className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl flex flex-col">
                <div className="px-5 py-4 border-b flex items-center justify-between">
                  <div className="text-lg font-semibold text-red-600">Admin Panel</div>
                  <button className="p-2 rounded hover:bg-gray-100" onClick={() => setOpen(false)} aria-label="Đóng menu">
                    <XMarkIcon className="h-6 w-6 text-gray-700" />
                  </button>
                </div>
                <NavItems />
                <SidebarFooter />
              </aside>
            </div>
          )}

          {/* Main */}
          <main className="flex-1 min-w-0 lg:mt-4">
            <div className="bg-white border rounded-2xl shadow-sm p-4 lg:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}