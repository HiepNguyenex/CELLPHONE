import { Link, NavLink } from "react-router-dom";
import { Menu, Package, ShoppingCart, Users, Settings, Plus, LogOut, LayoutGrid } from "lucide-react";

export default function AdminTopbar({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <Link to="/admin" className="font-semibold text-gray-900">
          Admin Panel
        </Link>

        <nav className="ml-4 hidden md:flex items-center gap-1 text-sm">
          <AdminLink to="/admin" icon={<LayoutGrid size={16} />} label="Dashboard" />
          <AdminLink to="/admin/products" icon={<Package size={16} />} label="Sản phẩm" />
          <AdminLink to="/admin/orders" icon={<ShoppingCart size={16} />} label="Đơn hàng" />
          <AdminLink to="/admin/users" icon={<Users size={16} />} label="Người dùng" />
          <AdminLink to="/admin/settings" icon={<Settings size={16} />} label="Cài đặt" />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/admin/products"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
            title="Thêm sản phẩm"
          >
            <Plus size={16} /> Thêm
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline text-gray-600">Super Admin</span>
            <button className="p-2 rounded-lg hover:bg-gray-100" title="Đăng xuất">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function AdminLink({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `px-3 py-1.5 rounded-lg hover:bg-gray-100 ${
          isActive ? "bg-gray-100 text-gray-900" : "text-gray-600"
        }`
      }
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
    </NavLink>
  );
}
