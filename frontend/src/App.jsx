import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import BooksManagementPage from "./pages/admin/BooksManagementPage";
import BookFormPage from "./pages/admin/BookFormPage";
import OrdersManagementPage from "./pages/admin/OrdersManagementPage";
import UsersManagementPage from "./pages/admin/UsersManagementPage";
import InventoryManagementPage from "./pages/admin/InventoryManagementPage";
import OrdersWarehousePage from "./pages/admin/OrdersWarehousePage";
import "./App.css";
import "./components/layout/layout.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes with Main Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Add routes for About and Contact pages when they're created */}
            <Route path="/about" element={<div className="container mx-auto py-10 px-4"><h1>About Us</h1></div>} />
            <Route path="/contact" element={<div className="container mx-auto py-10 px-4"><h1>Contact Us</h1></div>} />
            <Route path="/books" element={<div className="container mx-auto py-10 px-4"><h1>All Books</h1></div>} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="books" element={<BooksManagementPage />} />
            <Route path="books/add" element={<BookFormPage />} />
            <Route path="books/edit/:id" element={<BookFormPage />} />
            <Route path="orders" element={<OrdersManagementPage />} />
            <Route path="users" element={<UsersManagementPage />} />
            {/* Warehouse Manager Routes */}
            <Route path="inventory" element={<InventoryManagementPage />} />
            <Route path="warehouse-orders" element={<OrdersWarehousePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
