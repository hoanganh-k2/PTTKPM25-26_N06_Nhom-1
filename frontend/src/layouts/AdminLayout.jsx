import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Icons
import { 
  BookOpen, 
  PackageCheck, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Quản lý Sách', href: '/admin/books', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Quản lý Đơn hàng', href: '/admin/orders', icon: <PackageCheck className="w-5 h-5" /> },
    { name: 'Quản lý Người dùng', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Cài đặt', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-30 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="text-xl font-bold text-primary">Admin Dashboard</div>
          <button 
            className="p-1 rounded-md -mr-1 lg:hidden" 
            onClick={toggleSidebar}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive(item.href)
                  ? 'bg-primary-50 text-primary'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-4 w-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button 
              className="p-2 lg:hidden" 
              onClick={toggleSidebar}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:ml-4"></div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="relative ml-3">
                  <div>
                    <button className="flex text-sm rounded-full focus:outline-none">
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                        A
                      </div>
                      <span className="hidden md:flex items-center ml-2">
                        Admin
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
