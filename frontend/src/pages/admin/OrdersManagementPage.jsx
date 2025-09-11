import { useState, useEffect } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import orderService from '../../services/order.service';

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Giả lập dữ liệu
      setTimeout(() => {
        const mockOrders = [
          {
            id: 'ORD001',
            orderDate: '2023-10-15',
            customer: { id: '1', name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0912345678' },
            total: 235000,
            status: 'Đã giao hàng',
            paymentMethod: 'COD',
            items: [
              { id: '1', title: 'Đắc Nhân Tâm', quantity: 1, price: 120000 },
              { id: '3', title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', quantity: 1, price: 85000 },
              { id: 'SHIP', title: 'Phí vận chuyển', quantity: 1, price: 30000 }
            ],
            shippingAddress: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
            notes: ''
          },
          {
            id: 'ORD002',
            orderDate: '2023-10-16',
            customer: { id: '2', name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0923456789' },
            total: 108000,
            status: 'Đang giao hàng',
            paymentMethod: 'Chuyển khoản ngân hàng',
            items: [
              { id: '2', title: 'Nhà Giả Kim', quantity: 1, price: 90000 },
              { id: 'SHIP', title: 'Phí vận chuyển', quantity: 1, price: 18000 }
            ],
            shippingAddress: '456 Đường XYZ, Quận 2, TP. Hồ Chí Minh',
            notes: 'Giao hàng ngoài giờ hành chính'
          },
          {
            id: 'ORD003',
            orderDate: '2023-10-17',
            customer: { id: '3', name: 'Lê Văn C', email: 'levanc@gmail.com', phone: '0934567890' },
            total: 186000,
            status: 'Chờ xác nhận',
            paymentMethod: 'Ví điện tử MoMo',
            items: [
              { id: '4', title: 'Dế Mèn Phiêu Lưu Ký', quantity: 2, price: 156000 },
              { id: 'SHIP', title: 'Phí vận chuyển', quantity: 1, price: 30000 }
            ],
            shippingAddress: '789 Đường KLM, Quận 3, TP. Hồ Chí Minh',
            notes: ''
          },
          {
            id: 'ORD004',
            orderDate: '2023-10-18',
            customer: { id: '4', name: 'Phạm Thị D', email: 'phamthid@gmail.com', phone: '0945678901' },
            total: 138000,
            status: 'Đã hủy',
            paymentMethod: 'COD',
            items: [
              { id: '1', title: 'Đắc Nhân Tâm', quantity: 1, price: 120000 },
              { id: 'SHIP', title: 'Phí vận chuyển', quantity: 1, price: 18000 }
            ],
            shippingAddress: '101 Đường PQR, Quận 4, TP. Hồ Chí Minh',
            notes: 'Khách hàng yêu cầu hủy đơn hàng'
          }
        ];
        
        setOrders(mockOrders);
        setTotalPages(3); // Giả lập có 3 trang
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Chờ xác nhận':
        return 'bg-blue-100 text-blue-800';
      case 'Đang giao hàng':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đã giao hàng':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Quản lý Đơn hàng</h2>
        <p className="text-gray-500">Quản lý đơn hàng của hiệu sách</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex w-full md:w-1/2 gap-2">
              <Input
                type="search"
                placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="border rounded-md px-3 py-1 bg-white"
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="Chờ xác nhận">Chờ xác nhận</option>
                  <option value="Đang giao hàng">Đang giao hàng</option>
                  <option value="Đã giao hàng">Đã giao hàng</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Mã đơn hàng</th>
                  <th className="pb-2 text-left font-medium">Ngày đặt</th>
                  <th className="pb-2 text-left font-medium">Khách hàng</th>
                  <th className="pb-2 text-right font-medium">Tổng tiền</th>
                  <th className="pb-2 text-left font-medium">Phương thức thanh toán</th>
                  <th className="pb-2 text-center font-medium">Trạng thái</th>
                  <th className="pb-2 text-center font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-4 text-center">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-4 text-center">
                      Không có đơn hàng nào được tìm thấy.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 font-medium">{order.id}</td>
                      <td className="py-4">{formatDate(order.orderDate)}</td>
                      <td className="py-4">
                        <div>{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.phone}</div>
                      </td>
                      <td className="py-4 text-right font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-4">{order.paymentMethod}</td>
                      <td className="py-4">
                        <div className="flex justify-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-center">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Hiển thị {orders.length} / {totalPages * orders.length} kết quả
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowOrderDetail(false)}
              >
                &times;
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium mb-2">Thông tin đơn hàng</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mã đơn hàng:</span>
                    <span className="font-medium">{selectedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày đặt hàng:</span>
                    <span>{formatDate(selectedOrder.orderDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trạng thái:</span>
                    <span className={`${getStatusColor(selectedOrder.status)} px-2 py-0.5 rounded text-xs`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phương thức thanh toán:</span>
                    <span>{selectedOrder.paymentMethod}</span>
                  </div>
                  {selectedOrder.notes && (
                    <div className="pt-1">
                      <span className="text-gray-500">Ghi chú:</span>
                      <p className="mt-1 p-2 bg-gray-50 rounded">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tên:</span>
                    <span>{selectedOrder.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email:</span>
                    <span>{selectedOrder.customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số điện thoại:</span>
                    <span>{selectedOrder.customer.phone}</span>
                  </div>
                  <div className="pt-1">
                    <span className="text-gray-500">Địa chỉ giao hàng:</span>
                    <p className="mt-1 p-2 bg-gray-50 rounded">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <h4 className="font-medium mb-2">Chi tiết sản phẩm</h4>
            <div className="overflow-x-auto mb-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Sản phẩm</th>
                    <th className="pb-2 text-center font-medium">Số lượng</th>
                    <th className="pb-2 text-right font-medium">Đơn giá</th>
                    <th className="pb-2 text-right font-medium">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2">{item.title}</td>
                      <td className="py-2 text-center">{item.quantity}</td>
                      <td className="py-2 text-right">{formatCurrency(item.price / item.quantity)}</td>
                      <td className="py-2 text-right font-medium">{formatCurrency(item.price)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan="3" className="py-2 text-right font-medium">Tổng cộng:</td>
                    <td className="py-2 text-right font-bold">{formatCurrency(selectedOrder.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              {selectedOrder.status === 'Chờ xác nhận' && (
                <div className="space-x-2">
                  <Button variant="outline" className="bg-red-50 text-red-600 hover:bg-red-100">
                    Hủy đơn
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Xác nhận đơn
                  </Button>
                </div>
              )}
              {selectedOrder.status === 'Đang giao hàng' && (
                <Button className="bg-green-600 hover:bg-green-700">
                  Đánh dấu đã giao
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={() => setShowOrderDetail(false)}
                className="ml-auto"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
