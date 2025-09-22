import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BarChart3, BookOpen, PackageCheck, Users, TrendingUp, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import dashboardService from '../../services/dashboard.service';
import './AdminPages.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockBooks: []
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Cache ref
  const cacheRef = useRef({
    data: null,
    timestamp: 0,
    ttl: 2 * 60 * 1000 // 2 minutes cache
  });

  // Auto refresh interval ref
  const intervalRef = useRef(null);

  // Memoized fetch function with cache
  const fetchData = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && cacheRef.current.data && (now - cacheRef.current.timestamp < cacheRef.current.ttl)) {
      setStats(cacheRef.current.data);
      setLoading(false);
      return;
    }

    const isInitialLoad = !cacheRef.current.data;
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      // Gọi API dashboard tập trung để lấy thống kê
      const dashboardStats = await dashboardService.getDashboardStats();

      const newStats = {
        totalBooks: dashboardStats.totalBooks || 0,
        totalOrders: dashboardStats.totalOrders || 0,
        totalUsers: dashboardStats.totalUsers || 0,
        totalRevenue: dashboardStats.totalRevenue || 0,
        recentOrders: dashboardStats.recentOrders || [],
        lowStockBooks: dashboardStats.lowStockBooks || []
      };

      // Update cache
      cacheRef.current = {
        data: newStats,
        timestamp: now,
        ttl: 2 * 60 * 1000
      };

      setStats(newStats);
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thống kê:', error);
      
      // Fallback sử dụng dữ liệu mặc định nếu API lỗi và không có cache
      if (!cacheRef.current.data) {
        const fallbackStats = {
          totalBooks: 248,
          totalOrders: 157,
          totalUsers: 84,
          totalRevenue: 15680000,
          recentOrders: [],
          lowStockBooks: []
        };
        setStats(fallbackStats);
        cacheRef.current.data = fallbackStats;
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  // Setup auto-refresh and initial load
  useEffect(() => {
    // Initial data load
    fetchData();

    // Setup auto-refresh every 5 minutes
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  // Memoized calculations
  const formattedStats = useMemo(() => ({
    totalBooks: stats.totalBooks.toLocaleString(),
    totalOrders: stats.totalOrders.toLocaleString(), 
    totalUsers: stats.totalUsers.toLocaleString(),
    totalRevenue: formatCurrency(stats.totalRevenue)
  }), [stats]);

  // Định dạng số tiền
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }, []);

  // Fake data cho biểu đồ doanh thu
  const revenueData = [
    { month: 'Tháng 1', revenue: 7500000 },
    { month: 'Tháng 2', revenue: 9200000 },
    { month: 'Tháng 3', revenue: 10500000 },
    { month: 'Tháng 4', revenue: 8700000 },
    { month: 'Tháng 5', revenue: 12300000 },
    { month: 'Tháng 6', revenue: 15680000 },
  ];

  // Fake data cho đơn hàng gần đây
  const recentOrders = [
    { id: 'ORD-001', customer: 'Nguyễn Văn A', date: '10/09/2025', total: 450000, status: 'completed' },
    { id: 'ORD-002', customer: 'Trần Thị B', date: '09/09/2025', total: 750000, status: 'processing' },
    { id: 'ORD-003', customer: 'Lê Văn C', date: '08/09/2025', total: 320000, status: 'shipped' },
    { id: 'ORD-004', customer: 'Phạm Thị D', date: '07/09/2025', total: 890000, status: 'completed' },
    { id: 'ORD-005', customer: 'Hoàng Văn E', date: '06/09/2025', total: 210000, status: 'pending' },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Hoàn thành';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang giao';
      case 'pending': return 'Chờ xử lý';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-title-icon"><LayoutDashboard size={20} /></span>
          <div>
            <h2>Dashboard</h2>
            {lastUpdated && (
              <p className="text-sm text-text-tertiary">
                Cập nhật lần cuối: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="admin-button admin-button-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 slide-up">
        <div className="admin-card">
          <div className="admin-card-content p-4 flex items-center gap-4">
            <div style={{
              background: 'linear-gradient(135deg, var(--primary-light), var(--primary))',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-tertiary">Tổng số sách</p>
              {loading ? (
                <div className="h-8 flex items-center">
                  <RefreshCw className="h-5 w-5 text-text-tertiary animate-spin" />
                </div>
              ) : (
                <h3 className="text-2xl font-bold text-text-primary">{formattedStats.totalBooks}</h3>
              )}
            </div>
          </div>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-content p-4 flex items-center gap-4">
            <div style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <PackageCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-tertiary">Đơn hàng</p>
              {loading ? (
                <div className="h-8 flex items-center">
                  <RefreshCw className="h-5 w-5 text-text-tertiary animate-spin" />
                </div>
              ) : (
                <h3 className="text-2xl font-bold text-text-primary">{formattedStats.totalOrders}</h3>
              )}
            </div>
          </div>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-content p-4 flex items-center gap-4">
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-tertiary">Người dùng</p>
              {loading ? (
                <div className="h-8 flex items-center">
                  <RefreshCw className="h-5 w-5 text-text-tertiary animate-spin" />
                </div>
              ) : (
                <h3 className="text-2xl font-bold text-text-primary">{formattedStats.totalUsers}</h3>
              )}
            </div>
          </div>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-content p-4 flex items-center gap-4">
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-tertiary">Doanh thu</p>
              {loading ? (
                <div className="h-8 flex items-center">
                  <RefreshCw className="h-5 w-5 text-text-tertiary animate-spin" />
                </div>
              ) : (
                <h3 className="text-xl font-bold text-text-primary">{formattedStats.totalRevenue}</h3>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-6">
        {/* Revenue Chart */}
        <div className="admin-card slide-up" style={{animationDelay: '0.1s'}}>
          <div className="admin-card-header">
            <div className="admin-card-title">
              <BarChart3 className="h-5 w-5 mr-2" />
              Doanh thu theo tháng
            </div>
          </div>
          <div className="admin-card-content">
            <div className="h-80">
              {/* Đây là nơi bạn sẽ hiển thị chart thực tế */}
              <div className="h-full flex flex-col justify-end">
                <div className="flex h-full items-end space-x-2">
                  {revenueData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        style={{ 
                          width: '100%',
                          background: 'linear-gradient(180deg, var(--primary-light), var(--primary))',
                          borderRadius: '6px 6px 0 0',
                          height: `${(item.revenue / 16000000) * 100}%`,
                          minHeight: '20px',
                          boxShadow: '0 3px 10px rgba(79, 70, 229, 0.2)'
                        }}
                      />
                      <div className="text-xs mt-2 text-text-tertiary">{item.month}</div>
                      <div className="text-xs font-medium text-text-secondary">{formatCurrency(item.revenue).replace('₫', '').trim()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-card slide-up" style={{animationDelay: '0.2s'}}>
          <div className="admin-card-header">
            <div className="admin-card-title">
              <PackageCheck className="h-5 w-5 mr-2" />
              Đơn hàng gần đây
            </div>
          </div>
          <div className="admin-card-content">
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Giá trị</th>
                    <th style={{textAlign: 'center'}}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-medium">{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{formatCurrency(order.total)}</td>
                      <td style={{textAlign: 'center'}}>
                        <span className={`status-indicator ${
                          order.status === 'completed' ? 'status-completed' : 
                          order.status === 'processing' ? 'status-processing' : 
                          order.status === 'shipped' ? 'status-processing' : 
                          order.status === 'pending' ? 'status-pending' : 
                          'status-cancelled'
                        }`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
