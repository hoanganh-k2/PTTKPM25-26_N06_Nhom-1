import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.css';

// Icons
import { 
  BookOpen, 
  PackageCheck, 
  Users, 
  BarChart3, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  LibraryBig,
  Bell,
  Search,
  Package,
  LayoutDashboard
} from 'lucide-react';

export default function AdminLayout() {
  const { logout, currentUser, isAdmin, isWarehouseManager } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Điều hướng menu dựa theo vai trò 
  const adminNavigation = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Quản lý Sản phẩm', href: '/admin/books', icon: <BookOpen size={20} /> },
    { name: 'Quản lý Đơn hàng', href: '/admin/orders', icon: <Package size={20} /> },
    { name: 'Quản lý Người dùng', href: '/admin/users', icon: <Users size={20} /> },
    { name: 'Cập nhật Trạng thái Kho', href: '/admin/inventory', icon: <LibraryBig size={20} /> },
    { name: 'Xác nhận Đơn hàng', href: '/admin/warehouse-orders', icon: <PackageCheck size={20} /> },
  ];

  const warehouseNavigation = [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Cập nhật Trạng thái Kho', href: '/admin/inventory', icon: <LibraryBig size={20} /> },
    { name: 'Xác nhận Đơn hàng', href: '/admin/warehouse-orders', icon: <PackageCheck size={20} /> },
  ];
  
  // Chọn menu phù hợp với vai trò
  const navigation = isAdmin ? adminNavigation : warehouseNavigation;

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    logout();
    // Redirect to login page
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Kiểm tra quyền truy cập
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Chỉ cho phép admin và thủ kho truy cập
  if (!isAdmin && !isWarehouseManager) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden" 
          onClick={toggleSidebar}
          style={{backdropFilter: 'blur(3px)'}}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`admin-sidebar fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="admin-sidebar-header flex items-center justify-between">
          <div className="admin-sidebar-title">
            <span className="logo-icon">
              <BookOpen size={16} />
            </span>
            Bookstore Admin
          </div>
          <button 
            className="p-2 rounded-md text-white lg:hidden" 
            onClick={toggleSidebar}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="admin-sidebar-nav">
          {navigation.map((item, index) => (
            <div key={item.name} className="admin-nav-item" style={{"--index": index}}>
              <Link
                to={item.href}
                className={`admin-nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-text">{item.name}</span>
              </Link>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            onClick={handleLogout}
            className="admin-logout-btn"
          >
            <LogOut size={20} className="admin-logout-icon" />
            <span className="ml-3">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-content">
        {/* Top navbar */}
        <header className="admin-header">
          <div className="admin-header-content">
            <button 
              className="admin-mobile-toggle lg:hidden" 
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            
            <div className="admin-header-right">
              <div className="admin-notification">
                <button className="admin-notification-btn">
                  <Bell size={20} />
                </button>
              </div>
              
              <div className="admin-user-profile">
                <div className="admin-avatar">
                  {currentUser?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="admin-user-info">
                  <span className="admin-user-name">{currentUser?.fullName || 'Admin'}</span>
                  <ChevronDown size={16} className="admin-chevron" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
