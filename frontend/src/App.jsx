import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import BooksManagementPage from "./pages/admin/BooksManagementPage";
import BookFormPage from "./pages/admin/BookFormPage";
import OrdersManagementPage from "./pages/admin/OrdersManagementPage";
import UsersManagementPage from "./pages/admin/UsersManagementPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="books" element={<BooksManagementPage />} />
            <Route path="books/add" element={<BookFormPage />} />
            <Route path="books/edit/:id" element={<BookFormPage />} />
            <Route path="orders" element={<OrdersManagementPage />} />
            <Route path="users" element={<UsersManagementPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
