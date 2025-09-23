import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import orderService from '../services/order.service';
import './OrderDetailPage.css';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchOrderDetail();
  }, [id, user, navigate]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderService.getOrderById(id);
      setOrder(response);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
      setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
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

  if (loading) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="loading">Đang tải thông tin đơn hàng...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="error-message">
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={() => navigate('/profile')} className="btn-secondary">
                Quay lại
              </button>
              <button onClick={fetchOrderDetail} className="btn-primary">
                Thử lại
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <div className="order-detail-container">
          <div className="error-message">
            <p>Không tìm thấy đơn hàng.</p>
            <button onClick={() => navigate('/profile')} className="btn-secondary">
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-container">
        <div className="order-detail-header">
          <button onClick={() => navigate('/profile')} className="back-button">
            ← Quay lại
          </button>
          <h1>Chi tiết đơn hàng #{order.id}</h1>
        </div>

        <div className="order-detail-content">
          {/* Order Status */}
          <div className="detail-section">
            <h2>Trạng thái đơn hàng</h2>
            <div className="status-info">
              <div className="status-item">
                <label>Trạng thái:</label>
                {getStatusBadge(order.status)}
              </div>
              <div className="status-item">
                <label>Thanh toán:</label>
                {getPaymentStatusBadge(order.paymentStatus)}
              </div>
              <div className="status-item">
                <label>Ngày đặt:</label>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="status-item">
                <label>Phương thức thanh toán:</label>
                <span>{getPaymentMethodText(order.paymentMethod)}</span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="detail-section">
            <h2>Sản phẩm đã đặt</h2>
            <div className="order-items-detail">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="order-item-detail">
                  <div className="item-info">
                    <h3>{item.bookTitle}</h3>
                  </div>
                  <div className="item-quantity">
                    Số lượng: {item.quantity}
                  </div>
                  <div className="item-price">
                    Đơn giá: {item.price?.toLocaleString('vi-VN')} ₫
                  </div>
                  <div className="item-total">
                    Thành tiền: {(item.price * item.quantity)?.toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              ))}
              
              <div className="order-total-detail">
                <div className="total-row">
                  <span>Tạm tính:</span>
                  <span>{order.totalAmount?.toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="total-row">
                  <span>Phí vận chuyển:</span>
                  <span>0 ₫</span>
                </div>
                <div className="total-row final">
                  <span>Tổng cộng:</span>
                  <span>{order.totalAmount?.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="detail-section">
            <h2>Thông tin giao hàng</h2>
            <div className="address-info">
              <div className="address-item">
                <label>Họ tên:</label>
                <span>{order.shippingAddress?.fullName}</span>
              </div>
              <div className="address-item">
                <label>Số điện thoại:</label>
                <span>{order.shippingAddress?.phone}</span>
              </div>
              <div className="address-item">
                <label>Địa chỉ:</label>
                <span>{order.shippingAddress?.address}</span>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          {order.billingAddress && (
            <div className="detail-section">
              <h2>Thông tin thanh toán</h2>
              <div className="address-info">
                <div className="address-item">
                  <label>Họ tên:</label>
                  <span>{order.billingAddress?.fullName}</span>
                </div>
                <div className="address-item">
                  <label>Số điện thoại:</label>
                  <span>{order.billingAddress?.phone}</span>
                </div>
                <div className="address-item">
                  <label>Địa chỉ:</label>
                  <span>{order.billingAddress?.address}</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Actions */}
          <div className="detail-actions">
            {order.status === 'pending' && (
              <button 
                className="btn-danger"
                onClick={() => alert('Chức năng hủy đơn hàng sẽ được phát triển sau')}
              >
                Hủy đơn hàng
              </button>
            )}
            <button 
              className="btn-primary"
              onClick={() => navigate('/books')}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}