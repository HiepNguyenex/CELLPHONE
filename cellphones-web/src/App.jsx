import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Article from "./pages/Article";
import FAQ from "./pages/FAQ";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyAccount from "./pages/MyAccount";
import OrderDetail from "./pages/OrderDetail";
import Orders from "./pages/Orders";
import PasswordChange from "./pages/PasswordChange";
import Wishlist from "./pages/Wishlist";
import Search from "./pages/Search";
import ProductDetail from "./pages/ProductDetail";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";
import PasswordReset from "./pages/PasswordReset";
import Topbar from "./components/Topbar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import ProductsAdmin from "./admin/ProductsAdmin";
import OrdersAdmin from "./admin/OrdersAdmin";
import UsersAdmin from "./admin/UsersAdmin";
import CategoriesAdmin from "./admin/CategoriesAdmin";
import SettingsAdmin from "./admin/SettingsAdmin";
import BrandsAdmin from "./admin/BrandsAdmin";

import AuthProvider from "./context/AuthContext";
import RequireAuth from "./components/RequireAuth";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./components/Toast";

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <AuthProvider>
      <ToastProvider>
        <WishlistProvider>
          {!isAdminRoute && (
            <>
              <Topbar />
              <Navbar />
            </>
          )}

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/article/:id" element={<Article />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/search" element={<Search />} />
            <Route
              path="/wishlist"
              element={
                <RequireAuth>
                  <Wishlist />
                </RequireAuth>
              }
            />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/thankyou" element={<ThankYou />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-reset" element={<PasswordReset />} />

            {/* USER AUTH */}
            <Route
              path="/my-account"
              element={
                <RequireAuth>
                  <MyAccount />
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <Orders />
                </RequireAuth>
              }
            />
            <Route
              path="/order/:id"
              element={
                <RequireAuth>
                  <OrderDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/password-change"
              element={
                <RequireAuth>
                  <PasswordChange />
                </RequireAuth>
              }
            />

            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={
                <RequireAuth requireAdmin>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="categories" element={<CategoriesAdmin />} />
              <Route path="brands" element={<BrandsAdmin />} />
              <Route path="orders" element={<OrdersAdmin />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>

          {!isAdminRoute && <Footer />}
        </WishlistProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
