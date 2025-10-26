import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { BookOpen, PackageCheck, Users, TrendingUp, RefreshCw, LayoutDashboard, AlertTriangle, Box } from 'lucide-react';
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

      {/* Low Stock Warning Card */}
      <div className="dashboard-section mt-6">
        <div className="dashboard-section-header">
          <h3 className="dashboard-section-title">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            Cảnh báo tồn kho thấp
          </h3>
          <span className="dashboard-section-badge">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : stats.lowStockBooks.length}
          </span>
        </div>

        <div className="dashboard-low-stock-container">
          {loading ? (
            <div className="dashboard-loading-state">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : stats.lowStockBooks.length === 0 ? (
            <div className="dashboard-empty-state">
              <Box className="h-12 w-12 text-gray-300" />
              <p>Không có sách nào tồn kho thấp</p>
            </div>
          ) : (
            <div className="dashboard-low-stock-list">
              {stats.lowStockBooks.map((book) => (
                <div key={book.id} className="dashboard-low-stock-item">
                  <div className="dashboard-low-stock-image">
                    <img 
                      src={book.coverImage || "/assets/book-placeholder.png"} 
                      alt={book.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/book-placeholder.png";
                      }}
                    />
                  </div>
                  <div className="dashboard-low-stock-info">
                    <h4 className="dashboard-low-stock-title">{book.title}</h4>
                    <div className="dashboard-low-stock-meta">
                      <span className="dashboard-low-stock-author">
                        {book.authors && book.authors.length > 0 
                          ? book.authors.map(author => author.name).join(', ')
                          : book.author?.name || book.specifications?.['Tác giả'] || 'Không có tác giả'
                        }
                      </span>
                      <span className="dashboard-low-stock-price">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book.price || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="dashboard-low-stock-count">
                    <span className={`stock-badge ${book.stock <= 5 ? 'critical' : 'warning'}`}>
                      {book.stock} cuốn
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
