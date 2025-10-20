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

  const fetchUserOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      try {
        // Gọi API thực
        const response = await orderService.getUserOrders();
        console.log('Order API response:', response);
        
        // Xử lý dữ liệu từ API
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
        
        if (orderData && orderData.length > 0) {
          console.log('Đã lấy được dữ liệu từ API:', orderData);
          
          // Lấy thông tin chi tiết sách cho mỗi item (bao gồm hình ảnh)
          for (const order of orderData) {
            if (order.items && order.items.length > 0) {
              for (const item of order.items) {
                try {
                  // Lấy thông tin sách từ API books
                  const bookResponse = await fetch(`http://localhost:3000/api/books/${item.bookId}`);
                  if (bookResponse.ok) {
                    const bookData = await bookResponse.json();
                    // Thêm thông tin hình ảnh và tác giả vào item
                    item.coverImage = bookData.coverImage || bookData.cover_image;
                    item.bookAuthor = bookData.author?.name || item.bookAuthor;
                  }
                } catch (err) {
                  console.warn(`Không thể lấy thông tin sách ${item.bookId}:`, err);
                }
              }
            }
          }
          
          setOrders(orderData);
        } else {
          console.log('API trả về dữ liệu trống');
          setOrders([]);
        }
      } catch (apiError) {
        console.warn('Lỗi khi gọi API:', apiError);
        setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.');
        setOrders([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error);
      setError(error.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
  
  // Get book image function - lấy ảnh giống CartPage
  const getBookImage = (book) => {
    if (!book) return "/assets/book-placeholder.png";
    
    // Ưu tiên sử dụng coverImage như CartPage
    if (book.coverImage) return book.coverImage;
    if (book.cover_image) return book.cover_image;
    if (book.image) return book.image;
    if (book.thumbnail) return book.thumbnail;
    if (book.bookImage) return book.bookImage;
    
    // Fallback về placeholder
    return "/assets/book-placeholder.png";
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
                    <div key={order.id} className="order-card shopee-style">
                      <div className="order-header">
                        <div className="shop-info">
                          <span className="shop-name">BookStore</span>
                          <button className="btn-chat">Chat</button>
                        </div>
                        <div className="order-status-container">
                          <div className="order-status-icon">
                            {order.status === 'delivered' && <span className="status-icon delivered">✓</span>}
                            {order.status === 'pending' && <span className="status-icon pending">⏱</span>}
                            {order.status === 'cancelled' && <span className="status-icon cancelled">✗</span>}
                          </div>
                          <div className="order-status-text">
                            <span className="order-status-label">
                              {getStatusBadge(order.status)}
                            </span>
                            <span className="order-payment-status">
                              {getPaymentStatusBadge(order.paymentStatus)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {order.items && order.items.map((item, index) => (
                        <div key={index} className="order-product">
                          <div className="product-image">
                            <img 
                              src={getBookImage(item)} 
                              onError={(e) => {
                                e.target.onerror = null; 
                                e.target.src = "/assets/book-placeholder.png";
                              }}
                              alt={item.bookTitle || "Sách"} 
                              loading="lazy"
                            />
                          </div>
                          <div className="product-info">
                            <div className="product-name">{item.bookTitle}</div>
                            <div className="product-variation">Tác giả: {item.bookAuthor || "Đang cập nhật"}</div>
                            <div className="product-quantity">x{item.quantity}</div>
                          </div>
                          <div className="product-price">
                            <div className="original-price">{(item.price * 1.2)?.toLocaleString('vi-VN')}₫</div>
                            <div className="actual-price">{item.price?.toLocaleString('vi-VN')}₫</div>
                          </div>
                        </div>
                      ))}

                      <div className="order-footer">
                        <div className="order-total-container">
                          <div className="order-date-info">
                            <span className="order-id">Đơn hàng #{order.id}</span>
                            <span className="order-date">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="total-section">
                            <span className="total-label">Thành tiền:</span>
                            <span className="total-amount">{order.totalAmount?.toLocaleString('vi-VN')}₫</span>
                          </div>
                        </div>
                        
                        <div className="order-actions shopee-style">
                          <button 
                            className="btn-order-detail"
                            onClick={() => navigate(`/orders/${order.id}`)}
                          >
                            Xem chi tiết
                          </button>
                          {order.status === 'delivered' && (
                            <button className="btn-buy-again">
                              Mua lại
                            </button>
                          )}
                          {order.status === 'pending' && (
                            <button 
                              className="btn-cancel-order"
                              onClick={() => alert('Chức năng hủy đơn hàng sẽ được phát triển sau')}
                            >
                              Hủy đơn hàng
                            </button>
                          )}
                          {order.status === 'delivered' && !order.isReviewed && (
                            <button className="btn-review">
                              Đánh giá
                            </button>
                          )}
                        </div>
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