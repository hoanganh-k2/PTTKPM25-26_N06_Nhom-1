import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ChevronLeft, ChevronRight, Package, Truck, Search, RefreshCw, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import inventoryService from '../../services/inventory.service';
import orderService from '../../services/order.service';
import './AdminPages.css';

export default function OrdersWarehousePage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Sử dụng endpoint admin để lấy tất cả đơn hàng
      const response = await orderService.getAllOrders({
        page: currentPage,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      
      console.log('Orders response:', response);
      
      // Xử lý response structure
      if (response && response.orders) {
        setOrders(response.orders);
        setTotalPages(Math.ceil((response.total || 0) / 10));
      } else if (response && Array.isArray(response.data)) {
        setOrders(response.data);
        setTotalPages(Math.ceil((response.total || response.data.length) / 10));
      } else if (Array.isArray(response)) {
        setOrders(response);
        setTotalPages(Math.ceil(response.length / 10));
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      setTotalPages(1);
      alert("Có lỗi xảy ra khi tải danh sách đơn hàng: " + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      // Cập nhật trạng thái đơn hàng thành "shipped" (đã giao cho shipper)
      await orderService.updateOrderStatus(orderId, 'shipped');
      // Refresh danh sách đơn hàng
      fetchOrders();
    } catch (error) {
      console.error("Error confirming order:", error);
      alert("Có lỗi xảy ra khi xác nhận đơn hàng");
    }
  };

  const handleProcessOrder = async (orderId) => {
    try {
      // Cập nhật trạng thái đơn hàng thành "processing" (đang xử lý)
      await orderService.updateOrderStatus(orderId, 'processing');
      // Refresh danh sách đơn hàng
      fetchOrders();
    } catch (error) {
      console.error("Error processing order:", error);
      alert("Có lỗi xảy ra khi xử lý đơn hàng");
    }
  };

  const filteredOrders = searchQuery
    ? orders.filter(order => {
        const orderId = order.id?.toString().toLowerCase() || '';
        const userEmail = order.user?.email?.toLowerCase() || '';
        const userName = order.user?.fullName?.toLowerCase() || '';
        const searchTerm = searchQuery.toLowerCase();
        
        return orderId.includes(searchTerm) || 
               userEmail.includes(searchTerm) || 
               userName.includes(searchTerm);
      })
    : orders;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-title-icon"><Truck size={20} /></span>
          <div>
            <h2>Quản lý Đơn Hàng</h2>
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
                placeholder="Tìm kiếm theo mã đơn hàng hoặc email..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="admin-form-input"
              />
            </div>
            
            <div className="admin-filters">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="admin-form-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đã giao cho vận chuyển</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
              <button className="admin-filter-btn" onClick={fetchOrders}>
                <Filter className="h-4 w-4" /> Lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          fontSize: '1.1rem',
          color: '#64748b'
        }}>
          Đang tải danh sách đơn hàng...
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {filteredOrders.map(order => (
              <div key={order.id} className="admin-card slide-up mb-0">
                <div className="admin-card-header">
                  <div className="admin-card-title flex justify-between items-center w-full">
                    <span>Đơn hàng #{order.id?.toString().substring(0, 8) || 'N/A'}</span>
                    <span className={`status-indicator ${
                      order.status === 'pending' ? 'status-pending' :
                      order.status === 'confirmed' ? 'status-confirmed' :
                      order.status === 'processing' ? 'status-processing' :
                      order.status === 'shipped' ? 'status-processing' :
                      order.status === 'delivered' ? 'status-completed' :
                      'status-cancelled'
                    }`}>
                      {
                        order.status === 'pending' ? 'Chờ xử lý' :
                        order.status === 'confirmed' ? 'Đã xác nhận' :
                        order.status === 'processing' ? 'Đang xử lý' :
                        order.status === 'shipped' ? 'Đã giao cho vận chuyển' :
                        order.status === 'delivered' ? 'Đã giao hàng' :
                        'Đã hủy'
                      }
                    </span>
                  </div>
                </div>
                <div className="admin-card-content">
                  <div className="grid gap-3">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Khách hàng:</span>
                      <span className="font-medium">{order.user?.fullName || order.user?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Email:</span>
                      <span>{order.user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Ngày đặt:</span>
                      <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Tổng tiền:</span>
                      <span className="font-semibold">{order.totalAmount ? formatCurrency(order.totalAmount) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Số lượng sản phẩm:</span>
                      <span>{order.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Địa chỉ giao hàng:</span>
                      <span className="text-right">
                        {order.shippingAddress?.address ? 
                          `${order.shippingAddress.address}${order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}` 
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <button 
                      className="admin-filter-btn"
                      onClick={() => navigate(`/admin/warehouse-orders/${order.id}`)}
                    >
                      <Package size={16} />
                      Chi tiết
                    </button>
                    
                    {order.status === 'pending' && (
                      <button 
                        onClick={() => handleProcessOrder(order.id)}
                        style={{
                          background: 'var(--warning)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Package size={16} />
                        Bắt đầu xử lý
                      </button>
                    )}
                    
                    {order.status === 'processing' && (
                      <button 
                        onClick={() => handleConfirmOrder(order.id)}
                        style={{
                          background: 'var(--success)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Truck size={16} />
                        Xác nhận giao hàng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="admin-empty-state">
              <span>Không tìm thấy đơn hàng nào phù hợp</span>
            </div>
          )}

          <div className="admin-pagination">
            <div className="admin-pagination-controls">
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <span className="admin-pagination-status">
                {currentPage} / {totalPages}
              </span>
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
