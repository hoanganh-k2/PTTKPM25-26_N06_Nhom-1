import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BookDetailPage from "./pages/BookDetailPage";
import BooksPage from "./pages/BooksPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProfilePage from "./pages/ProfilePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import BooksManagementPage from "./pages/admin/BooksManagementPage";
import BookFormPage from "./pages/admin/BookFormPage";
import OrdersManagementPage from "./pages/admin/OrdersManagementPage";
import OrderDetailAdminPage from "./pages/admin/OrderDetailAdminPage";
import UsersManagementPage from "./pages/admin/UsersManagementPage";
import InventoryManagementPage from "./pages/admin/InventoryManagementPage";
import OrdersWarehousePage from "./pages/admin/OrdersWarehousePage";
import "./App.css";
import "./components/layout/layout.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
          {/* Public Routes with Main Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/books/:id" element={<BookDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="books" element={<BooksManagementPage />} />
            <Route path="books/add" element={<BookFormPage />} />
            <Route path="books/edit/:id" element={<BookFormPage />} />
            <Route path="orders" element={<OrdersManagementPage />} />
            <Route path="orders/:id" element={<OrderDetailAdminPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            {/* Warehouse Manager Routes */}
            <Route path="inventory" element={<InventoryManagementPage />} />
            <Route path="warehouse-orders" element={<OrdersWarehousePage />} />
            <Route path="warehouse-orders/:id" element={<OrderDetailAdminPage />} />
          </Route>
        </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
