import { useState, useEffect } from 'react';
import { BarChart3, BookOpen, PackageCheck, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Trong một ứng dụng thực tế, bạn sẽ gọi API để lấy dữ liệu thống kê
    // Ở đây chúng ta sẽ giả lập dữ liệu
    const fetchData = async () => {
      try {
        // Giả lập dữ liệu
        setTimeout(() => {
          setStats({
            totalBooks: 248,
            totalOrders: 157,
            totalUsers: 84,
            totalRevenue: 15680000
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu thống kê:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Định dạng số tiền
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-500">Xem tổng quan về hoạt động của cửa hàng</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-primary-50 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tổng số sách</p>
              <h3 className="text-2xl font-bold">{loading ? '...' : stats.totalBooks}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-green-50 p-3 rounded-full">
              <PackageCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Đơn hàng</p>
              <h3 className="text-2xl font-bold">{loading ? '...' : stats.totalOrders}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-blue-50 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Người dùng</p>
              <h3 className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-purple-50 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Doanh thu</p>
              <h3 className="text-xl font-bold">{loading ? '...' : formatCurrency(stats.totalRevenue)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {/* Đây là nơi bạn sẽ hiển thị chart thực tế */}
              <div className="h-full flex flex-col justify-end">
                <div className="flex h-full items-end space-x-2">
                  {revenueData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-primary rounded-t" 
                        style={{ 
                          height: `${(item.revenue / 16000000) * 100}%`,
                          minHeight: '20px'
                        }}
                      />
                      <div className="text-xs mt-2">{item.month}</div>
                      <div className="text-xs font-medium">{formatCurrency(item.revenue).replace('₫', '').trim()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Mã đơn</th>
                    <th className="pb-2 text-left font-medium">Khách hàng</th>
                    <th className="pb-2 text-left font-medium">Giá trị</th>
                    <th className="pb-2 text-left font-medium">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b">
                      <td className="py-3 text-sm">{order.id}</td>
                      <td className="py-3 text-sm">{order.customer}</td>
                      <td className="py-3 text-sm">{formatCurrency(order.total)}</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
