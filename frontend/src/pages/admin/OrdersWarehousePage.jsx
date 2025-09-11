import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ChevronLeft, ChevronRight, Package, Truck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import inventoryService from '../../services/inventory.service';
import orderService from '../../services/order.service';

export default function OrdersWarehousePage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        page: currentPage,
        limit: 10,
        status: statusFilter
      });
      
      setOrders(response.orders);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      await inventoryService.confirmOrder(orderId);
      fetchOrders();
    } catch (error) {
      console.error("Error confirming order:", error);
    }
  };

  const filteredOrders = searchQuery
    ? orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : orders;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản Lý Đơn Hàng</h1>
      
      <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
        <div className="flex gap-2 items-center">
          <Input 
            placeholder="Tìm kiếm theo mã đơn hàng hoặc email..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipped">Đã giao cho vận chuyển</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <Button onClick={fetchOrders} variant="outline">Lọc</Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className="grid gap-4">
            {filteredOrders.map(order => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-start">
                    <span>Đơn hàng #{order.id.substring(0, 8)}</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {
                        order.status === 'pending' ? 'Chờ xử lý' :
                        order.status === 'processing' ? 'Đang xử lý' :
                        order.status === 'shipped' ? 'Đã giao cho vận chuyển' :
                        order.status === 'delivered' ? 'Đã giao hàng' :
                        'Đã hủy'
                      }
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Khách hàng:</span>
                      <span>{order.user.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{order.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày đặt:</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tổng tiền:</span>
                      <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số lượng sản phẩm:</span>
                      <span>{order.items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Địa chỉ giao hàng:</span>
                      <span className="text-right">{order.shippingAddress.address}, {order.shippingAddress.city}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      <Package size={16} />
                      Chi tiết
                    </Button>
                    
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <Button 
                        onClick={() => handleConfirmOrder(order.id)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                      >
                        <Truck size={16} />
                        Xác nhận giao hàng
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy đơn hàng nào phù hợp
            </div>
          )}

          <div className="flex justify-center mt-6">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Trước
              </Button>
              <span className="py-2 px-4 border rounded">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
