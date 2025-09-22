import { useState, useEffect } from 'react';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, ShoppingBag, X, RefreshCw, Check, Truck, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import orderService from '../../services/order.service';
import { ConfirmModal, Modal } from '../../components/ui/modal';
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
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, selectedStatus]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1);
        fetchOrders();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchQuery
      };
      
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      
      const result = await orderService.getAllOrders(params);
      
      // Xử lý dữ liệu trả về từ API
      setOrders(result.orders || result || []);
      
      // Tính tổng số trang từ total và limit
      const totalPages = Math.ceil((result.total || 0) / 10);
      setTotalPages(totalPages);
      
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      setOrders([]);
      setTotalPages(1);
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

  // Cập nhật trạng thái đơn hàng
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      if (!orderId || !newStatus) {
        alert('Dữ liệu không hợp lệ');
        return;
      }
      
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Cập nhật UI
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      // Cập nhật selectedOrder nếu đang hiển thị modal
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      alert('Cập nhật trạng thái đơn hàng thành công!');
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
    }
  };

  // Xác nhận đơn hàng
  const handleConfirmOrder = (order) => {
    try {
      if (!order || !order.id) {
        alert('Dữ liệu đơn hàng không hợp lệ');
        return;
      }
      setModalOrder(order);
      setShowConfirmModal(true);
    } catch (error) {
      console.error('Error in handleConfirmOrder:', error);
      alert('Có lỗi xảy ra');
    }
  };

  // Hoàn thành đơn hàng
  const handleCompleteOrder = (order) => {
    try {
      if (!order || !order.id) {
        alert('Dữ liệu đơn hàng không hợp lệ');
        return;
      }
      setModalOrder(order);
      setShowCompleteModal(true);
    } catch (error) {
      console.error('Error in handleCompleteOrder:', error);
      alert('Có lỗi xảy ra');
    }
  };

  // Hủy đơn hàng
  const handleCancelOrder = (order) => {
    try {
      if (!order || !order.id) {
        alert('Dữ liệu đơn hàng không hợp lệ');
        return;
      }
      setModalOrder(order);
      setShowCancelModal(true);
    } catch (error) {
      console.error('Error in handleCancelOrder:', error);
      alert('Có lỗi xảy ra');
    }
  };

  // Thực hiện xác nhận đơn hàng
  const confirmOrderAction = async () => {
    if (!modalOrder) return;
    
    setIsUpdating(true);
    try {
      await handleUpdateOrderStatus(modalOrder.id, 'shipping');
      setShowConfirmModal(false);
      setModalOrder(null);
    } catch (error) {
      console.error('Error confirming order:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Thực hiện hoàn thành đơn hàng
  const completeOrderAction = async () => {
    if (!modalOrder) return;
    
    setIsUpdating(true);
    try {
      await handleUpdateOrderStatus(modalOrder.id, 'delivered');
      setShowCompleteModal(false);
      setModalOrder(null);
    } catch (error) {
      console.error('Error completing order:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Thực hiện hủy đơn hàng
  const cancelOrderAction = async () => {
    if (!modalOrder) return;
    
    setIsUpdating(true);
    try {
      await handleUpdateOrderStatus(modalOrder.id, 'cancelled');
      setShowCancelModal(false);
      setModalOrder(null);
    } catch (error) {
      console.error('Error cancelling order:', error);
    } finally {
      setIsUpdating(false);
    }
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
    if (!value || isNaN(value)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(value));
  };

  // Format date ,,
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch (error) {
      return 'N/A';
    }
  };

  // Normalize status value
  const normalizeStatus = (status) => {
    if (!status) return 'pending';
    const statusLower = status.toString().toLowerCase();
    if (statusLower === 'pending' || statusLower === 'chờ xác nhận') return 'pending';
    if (statusLower === 'processing' || statusLower === 'shipping' || statusLower === 'đang giao hàng') return 'shipping';
    if (statusLower === 'delivered' || statusLower === 'đã giao hàng') return 'delivered';
    if (statusLower === 'cancelled' || statusLower === 'đã hủy') return 'cancelled';
    return 'pending'; // default fallback
  };

  // Get status display text
  const getStatusText = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'pending': return 'Chờ xác nhận';
      case 'shipping': return 'Đang giao hàng';
      case 'delivered': return 'Đã giao hàng';
      case 'cancelled': return 'Đã hủy';
      default: return status || 'N/A';
    }
  };

  // Get status CSS class
  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case 'pending': return 'status-pending';
      case 'shipping': return 'status-processing';
      case 'delivered': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
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
                      <td className="font-medium">{order.id || 'N/A'}</td>
                      <td>{formatDate(order.createdAt || order.orderDate)}</td>
                      <td>
                        <div>{order.user?.fullName || order.user?.full_name || 'N/A'}</div>
                        <div className="text-sm text-text-tertiary">{order.user?.phone || 'N/A'}</div>
                      </td>
                      <td style={{textAlign: 'right'}} className="font-medium">
                        {formatCurrency(order.totalAmount || 0)}
                      </td>
                      <td>{order.paymentMethod || 'N/A'}</td>
                      <td style={{textAlign: 'center'}}>
                        {(() => {
                          try {
                            return (
                              <span className={`status-indicator ${getStatusClass(order.status)}`}>
                                {getStatusText(order.status)}
                              </span>
                            );
                          } catch (error) {
                            console.error('Error rendering status:', error);
                            return <span className="status-indicator status-pending">N/A</span>;
                          }
                        })()}
                      </td>
                      <td className="actions">
                        <div className="action-buttons">
                          <button 
                            className="admin-action-btn view"
                            onClick={() => handleViewOrder(order)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {/* Hiển thị nút tương ứng với trạng thái */}
                          {(() => {
                            try {
                              const status = normalizeStatus(order.status);
                              if (status === 'pending') {
                                return (
                                  <>
                                    <button 
                                      className="admin-action-btn confirm"
                                      onClick={() => handleConfirmOrder(order)}
                                      title="Xác nhận đơn hàng"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button 
                                      className="admin-action-btn cancel"
                                      onClick={() => handleCancelOrder(order)}
                                      title="Hủy đơn hàng"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </>
                                );
                              }
                              
                              if (status === 'shipping') {
                                return (
                                  <>
                                    <button 
                                      className="admin-action-btn complete"
                                      onClick={() => handleCompleteOrder(order)}
                                      title="Đánh dấu đã giao"
                                    >
                                      <Truck className="h-4 w-4" />
                                    </button>
                                    <button 
                                      className="admin-action-btn cancel"
                                      onClick={() => handleCancelOrder(order)}
                                      title="Hủy đơn hàng"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </>
                                );
                              }
                              
                              return null;
                            } catch (error) {
                              console.error('Error rendering action buttons:', error);
                              return null;
                            }
                          })()}
                        </div>
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
      <Modal
        isOpen={showOrderDetail}
        onClose={() => setShowOrderDetail(false)}
        title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
        size="extra-large"
      >
        {selectedOrder && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="admin-card">
                <div className="admin-card-header">
                  <div className="admin-card-title">Thông tin đơn hàng</div>
                </div>
                <div className="admin-card-content">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Mã đơn hàng:</span>
                      <span className="font-medium">{selectedOrder.id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Ngày đặt hàng:</span>
                      <span>{formatDate(selectedOrder.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Trạng thái:</span>
                      <span className={`status-indicator ${getStatusClass(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Phương thức thanh toán:</span>
                      <span>{selectedOrder.paymentMethod || 'N/A'}</span>
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
                      <span className="font-medium">{selectedOrder.user?.fullName || selectedOrder.user?.full_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Email:</span>
                      <span>{selectedOrder.user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-text-tertiary">Số điện thoại:</span>
                      <span>{selectedOrder.user?.phone || 'N/A'}</span>
                    </div>
                    <div className="pt-2 border-t mt-2">
                      <span className="text-text-tertiary block mb-2">Địa chỉ giao hàng:</span>
                      <p className="p-3 bg-bg-light rounded-md">{selectedOrder.shippingAddress?.city || selectedOrder.shippingAddress?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="admin-card mb-6">
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
                      {(selectedOrder.items || []).map((item, index) => (
                        <tr key={item.id || index}>
                          <td>{item.book?.title || item.title || 'N/A'}</td>
                          <td style={{textAlign: 'center'}}>{item.quantity || 0}</td>
                          <td style={{textAlign: 'right'}}>{formatCurrency(item.unitPrice || 0)}</td>
                          <td style={{textAlign: 'right'}} className="font-medium">{formatCurrency(item.totalPrice || 0)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="3" style={{textAlign: 'right'}} className="font-medium">Tổng cộng:</td>
                        <td style={{textAlign: 'right'}} className="font-bold">{formatCurrency(selectedOrder.totalAmount || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              {normalizeStatus(selectedOrder.status) === 'pending' && (
                <div className="space-x-2">
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      setShowOrderDetail(false);
                      handleCancelOrder(selectedOrder);
                    }}
                  >
                    Hủy đơn
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => {
                      setShowOrderDetail(false);
                      handleConfirmOrder(selectedOrder);
                    }}
                  >
                    Xác nhận đơn
                  </button>
                </div>
              )}
              {normalizeStatus(selectedOrder.status) === 'shipping' && (
                <button 
                  className="btn btn-success"
                  onClick={() => {
                    setShowOrderDetail(false);
                    handleCompleteOrder(selectedOrder);
                  }}
                >
                  Đánh dấu đã giao
                </button>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Confirm Order Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmOrderAction}
        title="Xác nhận đơn hàng"
        message={`Bạn có chắc chắn muốn xác nhận đơn hàng #${modalOrder?.id}? Đơn hàng sẽ chuyển sang trạng thái "Đang giao hàng".`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        variant="primary"
        isLoading={isUpdating}
      />

      {/* Complete Order Modal */}
      <ConfirmModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={completeOrderAction}
        title="Hoàn thành đơn hàng"
        message={`Bạn có chắc chắn muốn đánh dấu đơn hàng #${modalOrder?.id} đã giao thành công?`}
        confirmText="Hoàn thành"
        cancelText="Hủy"
        variant="success"
        isLoading={isUpdating}
      />

      {/* Cancel Order Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={cancelOrderAction}
        title="Hủy đơn hàng"
        message={`Bạn có chắc chắn muốn hủy đơn hàng #${modalOrder?.id}? Hành động này không thể hoàn tác.`}
        confirmText="Hủy đơn hàng"
        cancelText="Không hủy"
        variant="danger"
        isLoading={isUpdating}
      />
    </div>
  );
}
