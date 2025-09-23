import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import orderService from "../services/order.service";
import "./OrdersPage.css";

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getUserOrders();
      setOrders(response.orders || []);
      setError(null);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', err);
      setError(err.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': { text: 'Chờ xử lý', class: 'status-pending' },
      'processing': { text: 'Đang xử lý', class: 'status-processing' },
      'shipped': { text: 'Đã giao hàng', class: 'status-shipped' },
      'delivered': { text: 'Đã nhận hàng', class: 'status-delivered' },
      'cancelled': { text: 'Đã hủy', class: 'status-cancelled' }
    };
    return statusMap[status] || { text: status, class: 'status-unknown' };
  };

  const getPaymentMethodDisplay = (method) => {
    const methodMap = {
      'cash_on_delivery': 'Thanh toán khi nhận hàng',
      'bank_transfer': 'Chuyển khoản ngân hàng',
      'credit_card': 'Thẻ tín dụng',
      'debit_card': 'Thẻ ghi nợ',
      'paypal': 'PayPal'
    };
    return methodMap[method] || method;
  };

  if (!isAuthenticated) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1>Đơn hàng của tôi</h1>
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <p>Vui lòng đăng nhập để xem đơn hàng</p>
            <Link to="/login" className="login-button">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1>Đơn hàng của tôi</h1>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Đang tải danh sách đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1>Đơn hàng của tôi</h1>
          <div className="error-state">
            <div className="error-icon">❌</div>
            <p>{error}</p>
            <button onClick={fetchOrders} className="retry-button">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1>Đơn hàng của tôi</h1>
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>Bạn chưa có đơn hàng nào</p>
            <p className="empty-subtitle">Hãy khám phá các sản phẩm và đặt hàng ngay!</p>
            <Link to="/books" className="shop-button">
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>Đơn hàng của tôi</h1>
        
        <div className="orders-list">
          {orders.map((order) => {
            const statusInfo = getStatusDisplay(order.status);
            
            return (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-id">Đơn hàng #{order.id}</h3>
                    <p className="order-date">
                      Đặt ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  <div className="order-items">
                    {order.items && order.items.length > 0 ? (
                      order.items.slice(0, 3).map((item, index) => (
                        <div key={index} className="order-item">
                          <span className="item-title">{item.bookTitle}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                          <span className="item-price">{item.price?.toLocaleString('vi-VN')} ₫</span>
                        </div>
                      ))
                    ) : (
                      <div className="order-item">
                        <span className="item-title">Đang tải thông tin sản phẩm...</span>
                      </div>
                    )}
                    {order.items && order.items.length > 3 && (
                      <div className="more-items">
                        +{order.items.length - 3} sản phẩm khác
                      </div>
                    )}
                  </div>

                  <div className="order-meta">
                    <div className="meta-item">
                      <span className="meta-label">Tổng tiền:</span>
                      <span className="meta-value total-amount">
                        {order.totalAmount?.toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Thanh toán:</span>
                      <span className="meta-value">
                        {getPaymentMethodDisplay(order.paymentMethod)}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Địa chỉ giao hàng:</span>
                      <span className="meta-value">
                        {order.shippingAddress || 'Đang cập nhật'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <Link to={`/orders/${order.id}`} className="view-detail-button">
                    Xem chi tiết
                  </Link>
                  {order.status === 'pending' && (
                    <button className="cancel-button">
                      Hủy đơn hàng
                    </button>
                  )}
                  {order.status === 'delivered' && (
                    <button className="reorder-button">
                      Đặt lại
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}