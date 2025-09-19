import { useState, useEffect } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, ShoppingBag, X, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import orderService from '../../services/order.service';
import './AdminPages.css';

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
    <div className="admin-container fade-in">
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-title-icon"><ShoppingBag size={20} /></span>
          <div>
            <h2>Quản lý Đơn hàng</h2>
          </div>
        </div>
      </div>

      <div className="admin-card slide-up">
        <div className="admin-card-content">
          <div className="admin-controls">
            <div className="admin-search">
              <Search className="admin-search-icon" />
              <input 
                type="search" 
                placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-form-input"
              />
            </div>
            
            <div className="admin-filters">
              <select
                value={selectedStatus}
                onChange={handleStatusChange}
                className="admin-form-select"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Đang giao hàng">Đang giao hàng</option>
                <option value="Đã giao hàng">Đã giao hàng</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
              <button className="admin-filter-btn" onClick={handleSearch}>
                <Filter className="h-4 w-4" /> Lọc
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Ngày đặt</th>
                  <th>Khách hàng</th>
                  <th style={{textAlign: 'right'}}>Tổng tiền</th>
                  <th>Phương thức thanh toán</th>
                  <th style={{textAlign: 'center'}}>Trạng thái</th>
                  <th style={{textAlign: 'center'}}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      <div className="admin-loading">
                        <div className="admin-loading-spinner">
                          <RefreshCw className="h-8 w-8" />
                        </div>
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      Không có đơn hàng nào được tìm thấy.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td className="font-medium">{order.id}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>
                        <div>{order.customer.name}</div>
                        <div className="text-sm text-text-tertiary">{order.customer.phone}</div>
                      </td>
                      <td style={{textAlign: 'right'}} className="font-medium">
                        {formatCurrency(order.total)}
                      </td>
                      <td>{order.paymentMethod}</td>
                      <td style={{textAlign: 'center'}}>
                        <span className={`status-indicator ${
                          order.status === 'Chờ xác nhận' ? 'status-pending' : 
                          order.status === 'Đang giao hàng' ? 'status-processing' : 
                          order.status === 'Đã giao hàng' ? 'status-completed' : 
                          'status-cancelled'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button 
                          className="admin-action-btn view"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="admin-pagination">
            <div className="pagination-info">
              Hiển thị {orders.length} / {totalPages * orders.length} kết quả
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto fade-in">
            <div className="flex justify-between items-center mb-5 pb-3 border-b">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-primary h-5 w-5" />
                <h3 className="text-lg font-bold">Chi tiết đơn hàng #{selectedOrder.id}</h3>
              </div>
              <button 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowOrderDetail(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 slide-up">
              <div className="admin-card">
                <div className="admin-card-header">
                  <div className="admin-card-title">Thông tin đơn hàng</div>
                </div>
                <div className="admin-card-content">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Mã đơn hàng:</span>
                      <span className="font-medium">{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Ngày đặt hàng:</span>
                      <span>{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Trạng thái:</span>
                      <span className={`status-indicator ${
                          selectedOrder.status === 'Chờ xác nhận' ? 'status-pending' : 
                          selectedOrder.status === 'Đang giao hàng' ? 'status-processing' : 
                          selectedOrder.status === 'Đã giao hàng' ? 'status-completed' : 
                          'status-cancelled'
                        }`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Phương thức thanh toán:</span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                    {selectedOrder.notes && (
                      <div className="pt-2 border-t mt-2">
                        <span className="text-text-tertiary block mb-2">Ghi chú:</span>
                        <p className="p-3 bg-bg-light rounded-md">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="admin-card">
                <div className="admin-card-header">
                  <div className="admin-card-title">Thông tin khách hàng</div>
                </div>
                <div className="admin-card-content">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Tên:</span>
                      <span className="font-medium">{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Email:</span>
                      <span>{selectedOrder.customer.email}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Số điện thoại:</span>
                      <span>{selectedOrder.customer.phone}</span>
                    </div>
                    <div className="pt-2 border-t mt-2">
                      <span className="text-text-tertiary block mb-2">Địa chỉ giao hàng:</span>
                      <p className="p-3 bg-bg-light rounded-md">{selectedOrder.shippingAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="admin-card mb-6 slide-up" style={{animationDelay: '0.1s'}}>
              <div className="admin-card-header">
                <div className="admin-card-title">Chi tiết sản phẩm</div>
              </div>
              <div className="admin-card-content">
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th style={{textAlign: 'center'}}>Số lượng</th>
                        <th style={{textAlign: 'right'}}>Đơn giá</th>
                        <th style={{textAlign: 'right'}}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.title}</td>
                          <td style={{textAlign: 'center'}}>{item.quantity}</td>
                          <td style={{textAlign: 'right'}}>{formatCurrency(item.price / item.quantity)}</td>
                          <td style={{textAlign: 'right'}} className="font-medium">{formatCurrency(item.price)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="3" style={{textAlign: 'right'}} className="font-medium">Tổng cộng:</td>
                        <td style={{textAlign: 'right'}} className="font-bold">{formatCurrency(selectedOrder.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              {selectedOrder.status === 'Chờ xác nhận' && (
                <div className="space-x-2">
                  <button style={{
                    background: 'var(--bg-white)',
                    color: 'var(--error)',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '500',
                    border: '1px solid var(--error)'
                  }}>
                    Hủy đơn
                  </button>
                  <button style={{
                    background: 'var(--success)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '500'
                  }}>
                    Xác nhận đơn
                  </button>
                </div>
              )}
              {selectedOrder.status === 'Đang giao hàng' && (
                <button style={{
                  background: 'var(--success)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: '500'
                }}>
                  Đánh dấu đã giao
                </button>
              )}
              <button 
                className="admin-filter-btn"
                onClick={() => setShowOrderDetail(false)}
                style={{marginLeft: 'auto'}}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
