import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/order.service';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info'); // 'info' hoặc 'orders'

  useEffect(() => {
    console.log('ProfilePage useEffect - user:', user);
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserOrders();
  }, [user, navigate]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getUserOrders();
      
      
      // Backend trả về {orders: [], total: number, page: number, totalPages: number}
      let orderData = [];
      if (response && response.orders) {
        orderData = response.orders;
      } else if (response && response.data && response.data.orders) {
        orderData = response.data.orders;
      } else if (response && Array.isArray(response.data)) {
        orderData = response.data;
      } else if (Array.isArray(response)) {
        orderData = response;
      }
      
      console.log('Processed order data:', orderData);
      setOrders(orderData);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      console.error('Error response:', error.response);
      setError(error.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Chờ xử lý', class: 'status-pending' },
      confirmed: { text: 'Đã xác nhận', class: 'status-confirmed' },
      processing: { text: 'Đang xử lý', class: 'status-processing' },
      shipped: { text: 'Đang giao', class: 'status-shipped' },
      delivered: { text: 'Đã giao', class: 'status-delivered' },
      cancelled: { text: 'Đã hủy', class: 'status-cancelled' }
    };

    const statusInfo = statusMap[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getPaymentStatusBadge = (status) => {
    const statusMap = {
      pending: { text: 'Chờ thanh toán', class: 'payment-pending' },
      processing: { text: 'Đang xử lý', class: 'payment-processing' },
      completed: { text: 'Đã thanh toán', class: 'payment-completed' },
      failed: { text: 'Thất bại', class: 'payment-failed' },
      refunded: { text: 'Đã hoàn tiền', class: 'payment-refunded' }
    };

    const statusInfo = statusMap[status] || { text: status, class: 'payment-default' };
    return <span className={`payment-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      cash_on_delivery: 'Thanh toán khi nhận hàng',
      bank_transfer: 'Chuyển khoản ngân hàng',
      credit_card: 'Thẻ tín dụng',
      debit_card: 'Thẻ ghi nợ',
      paypal: 'PayPal'
    };
    return methodMap[method] || method;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Tài khoản của tôi</h1>
          <p>Quản lý thông tin cá nhân và đơn hàng</p>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            Thông tin cá nhân
          </button>
          <button 
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Đơn hàng của tôi
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'info' && (
            <div className="profile-info">
              <div className="info-card">
                <h2>Thông tin cá nhân</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Họ và tên:</label>
                    <span>{user.fullName || user.name || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Số điện thoại:</label>
                    <span>{user.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="info-item">
                    <label>Vai trò:</label>
                    <span className="role-badge">
                      {user.role === 'admin' ? 'Quản trị viên' : 
                       user.role === 'warehouse_manager' ? 'Quản lý kho' : 'Khách hàng'}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Ngày tham gia:</label>
                    <span>{user.createdAt ? formatDate(user.createdAt) : 'Không rõ'}</span>
                  </div>
                </div>
                
                <div className="profile-actions">
                  <button className="btn-secondary" onClick={() => alert('Chức năng cập nhật thông tin sẽ được phát triển sau')}>
                    Cập nhật thông tin
                  </button>
                  <button className="btn-danger" onClick={logout}>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <div className="orders-header">
                <h2>Đơn hàng của tôi</h2>
                <button 
                  className={`btn-refresh ${refreshing ? 'loading' : ''}`}
                  onClick={() => fetchUserOrders(true)}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <span className="btn-spinner"></span>
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <span className="refresh-icon">↻</span>
                      Làm mới
                    </>
                  )}
                </button>
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
              ) : error ? (
                <div className="error-message">
                  <p>{error}</p>
                  <button 
                    className="btn-primary"
                    onClick={fetchUserOrders}
                  >
                    Thử lại
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-orders">
                  <p>Bạn chưa có đơn hàng nào.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => navigate('/books')}
                  >
                    Mua sắm ngay
                  </button>
                </div>
              ) : (
                <div className="orders-list fade-in">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div className="order-id">
                          <strong>Đơn hàng #{order.id}</strong>
                          <span className="order-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="order-status">
                          {getStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </div>

                      <div className="order-details">
                        <div className="order-items">
                          <h4>Sản phẩm:</h4>
                          {order.items && order.items.map((item, index) => (
                            <div key={index} className="order-item">
                              <span className="item-title">{item.bookTitle}</span>
                              <span className="item-quantity">x{item.quantity}</span>
                              <span className="item-price">{item.price?.toLocaleString('vi-VN')} ₫</span>
                            </div>
                          ))}
                        </div>

                        <div className="order-info">
                          <div className="order-address">
                            <strong>Địa chỉ giao hàng:</strong>
                            <p>{order.shippingAddress?.fullName}</p>
                            <p>{order.shippingAddress?.phone}</p>
                            <p>{order.shippingAddress?.address}</p>
                          </div>
                          
                          <div className="order-payment">
                            <strong>Phương thức thanh toán:</strong>
                            <p>{getPaymentMethodText(order.paymentMethod)}</p>
                          </div>
                        </div>

                        <div className="order-total">
                          <strong>Tổng tiền: {order.totalAmount?.toLocaleString('vi-VN')} ₫</strong>
                        </div>
                      </div>

                      <div className="order-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Xem chi tiết
                        </button>
                        {order.status === 'pending' && (
                          <button 
                            className="btn-danger"
                            onClick={() => alert('Chức năng hủy đơn hàng sẽ được phát triển sau')}
                          >
                            Hủy đơn hàng
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}