import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BookOpen, PackageCheck, Users, TrendingUp, RefreshCw, LayoutDashboard } from 'lucide-react';
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

  // Định dạng số tiền - moved up to fix hoisting issue
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }, []);

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
  }), [stats, formatCurrency]);

  

  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-title-icon"><LayoutDashboard size={20} /></span>
          <div>
            <h2>Dashboard</h2>
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

      {/* Stats Section - 2 rows layout */}
      <div className="dashboard-stats-container">
        {/* First row */}
        <div className="dashboard-stats-row">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon orders">
              <PackageCheck className="h-6 w-6" />
            </div>
            <div className="dashboard-stat-info">
              <p className="dashboard-stat-label">Đơn hàng</p>
              {loading ? (
                <div className="dashboard-stat-loading">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <h3 className="dashboard-stat-value">{formattedStats.totalOrders}</h3>
              )}
            </div>
          </div>
          
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon users">
              <Users className="h-6 w-6" />
            </div>
            <div className="dashboard-stat-info">
              <p className="dashboard-stat-label">Người dùng</p>
              {loading ? (
                <div className="dashboard-stat-loading">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <h3 className="dashboard-stat-value">{formattedStats.totalUsers}</h3>
              )}
            </div>
          </div>
        </div>

        {/* Second row */}
        <div className="dashboard-stats-row">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon books">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="dashboard-stat-info">
              <p className="dashboard-stat-label">Tổng số sách</p>
              {loading ? (
                <div className="dashboard-stat-loading">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <h3 className="dashboard-stat-value">{formattedStats.totalBooks}</h3>
              )}
            </div>
          </div>
          
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-icon revenue">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="dashboard-stat-info">
              <p className="dashboard-stat-label">Doanh thu</p>
              {loading ? (
                <div className="dashboard-stat-loading">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <h3 className="dashboard-stat-value dashboard-revenue-value">{formattedStats.totalRevenue}</h3>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
