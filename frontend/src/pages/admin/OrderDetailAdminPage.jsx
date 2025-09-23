import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, CreditCard, Calendar, Truck, Check, X, RefreshCw } from 'lucide-react';
import orderService from '../../services/order.service';
import './AdminPages.css';

const OrderDetailAdminPageStyles = `
  .admin-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  .order-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #333;
    cursor: pointer;
    text-decoration: none;
  }

  .back-button:hover {
    background: #e9e9e9;
  }

  .order-header-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
    justify-content: flex-end;
  }

  .order-header-info h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }

  .order-status-badge {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
  }

  .order-detail-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    width: 100%;
  }

  @media (max-width: 1024px) {
    .order-detail-content {
      grid-template-columns: 1fr;
    }
  }

  .order-left-column,
  .order-right-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
  }

  .info-card {
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    width: 100%;
    box-sizing: border-box;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #ddd;
  }

  .card-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }

  .card-content {
    padding: 1rem;
  }

  .info-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 12px;
    background: #f9f9f9;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
  }

  .info-item div {
    flex: 1;
    min-width: 0;
  }

  .info-item .label {
    display: block;
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 4px;
  }

  .info-item .value {
    display: block;
    font-weight: 500;
    color: #333;
    word-wrap: break-word;
  }

  .payment-status-item {
    padding: 12px;
    background: #f9f9f9;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
  }

  .payment-status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    display: inline-block;
  }

  .payment-status.completed {
    background: #d4edda;
    color: #155724;
  }

  .payment-status.pending {
    background: #fff3cd;
    color: #856404;
  }

  .payment-status.failed {
    background: #f8d7da;
    color: #721c24;
  }

  .total-amount {
    margin-top: 1rem;
    padding: 1rem;
    background: #e8f5e8;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    box-sizing: border-box;
  }

  .total-label {
    color: #333;
    font-size: 1rem;
    font-weight: 500;
  }

  .total-value {
    color: #28a745;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .customer-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .customer-details {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 8px 12px;
    background: #f9f9f9;
    border-radius: 4px;
    gap: 1rem;
  }

  .detail-item .label {
    font-size: 0.875rem;
    color: #666;
    font-weight: 500;
    flex-shrink: 0;
  }

  .detail-item .value {
    color: #333;
    font-weight: 500;
    text-align: right;
    word-wrap: break-word;
  }

  .shipping-address {
    background: #f9f9f9;
    border-radius: 4px;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    width: 100%;
    box-sizing: border-box;
  }

  .address-header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
    color: #333;
    font-weight: 500;
  }

  .address-content {
    padding-left: 1rem;
    line-height: 1.4;
  }

  .address-name {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .address-phone {
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 4px;
  }

  .address-text {
    color: #555;
    word-wrap: break-word;
  }

  .products-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .product-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
    width: 100%;
    box-sizing: border-box;
    gap: 1rem;
  }

  .product-info {
    flex: 1;
    min-width: 0;
  }

  .product-title {
    margin: 0 0 4px 0;
    font-weight: 500;
    color: #333;
    word-wrap: break-word;
  }

  .product-id {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
  }

  .product-pricing {
    text-align: right;
    min-width: 120px;
    flex-shrink: 0;
  }

  .price-line {
    color: #666;
    font-size: 0.875rem;
    margin-bottom: 4px;
  }

  .subtotal {
    font-weight: 600;
    color: #28a745;
    font-size: 1rem;
  }

  .no-products {
    text-align: center;
    color: #999;
    padding: 2rem;
    font-style: italic;
  }

  .status-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .status-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-weight: 500;
    font-size: 0.9rem;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
  }

  .status-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .confirm-btn {
    background: #ffc107;
    border-color: #ffc107;
    color: #212529;
  }

  .confirm-btn:hover:not(:disabled) {
    background: #e0a800;
    border-color: #d39e00;
  }

  .process-btn {
    background: #007bff;
    border-color: #007bff;
    color: white;
  }

  .process-btn:hover:not(:disabled) {
    background: #0056b3;
    border-color: #004085;
  }

  .ship-btn {
    background: #28a745;
    border-color: #28a745;
    color: white;
  }

  .ship-btn:hover:not(:disabled) {
    background: #1e7e34;
    border-color: #1c7430;
  }

  .deliver-btn {
    background: #28a745;
    border-color: #28a745;
    color: white;
  }

  .deliver-btn:hover:not(:disabled) {
    background: #1e7e34;
    border-color: #1c7430;
  }

  .cancel-btn {
    background: #dc3545;
    border-color: #dc3545;
    color: white;
  }

  .cancel-btn:hover:not(:disabled) {
    background: #c82333;
    border-color: #bd2130;
  }

  .refresh-btn {
    background: #f8f9fa;
    border-color: #dee2e6;
    color: #495057;
  }

  .refresh-btn:hover:not(:disabled) {
    background: #e2e6ea;
    border-color: #dae0e5;
  }

  .status-pending {
    background: #fff3cd;
    color: #856404;
  }

  .status-confirmed {
    background: #d1ecf1;
    color: #0c5460;
  }

  .status-processing {
    background: #e2e3ff;
    color: #383d41;
  }

  .status-completed {
    background: #d4edda;
    color: #155724;
  }

  .status-cancelled {
    background: #f8d7da;
    color: #721c24;
  }
`;

export default function OrderDetailAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getOrderById(id);
      console.log('Order detail response:', response);
      
      // Xử lý response structure
      if (response && response.data) {
        setOrder(response.data);
      } else if (response) {
        setOrder(response);
      } else {
        setError('Không tìm thấy đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order detail:', error);
      setError(error.message || 'Có lỗi xảy ra khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(id, newStatus);
      
      // Cập nhật state local
      setOrder(prev => ({ ...prev, status: newStatus }));
      
      alert(`Đã cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng: ' + (error.message || error));
    } finally {
      setUpdating(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipped: 'Đã giao cho vận chuyển',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      shipped: 'status-processing',
      delivered: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      cash_on_delivery: 'Thanh toán khi nhận hàng',
      bank_transfer: 'Chuyển khoản ngân hàng',
      credit_card: 'Thẻ tín dụng',
      debit_card: 'Thẻ ghi nợ',
      paypal: 'PayPal'
    };
    return methodMap[method] || method || 'N/A';
  };

  if (loading) {
    return (
      <>
        <style>{OrderDetailAdminPageStyles}</style>
        <div className="admin-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            fontSize: '1.1rem',
            color: '#64748b'
          }}>
            Đang tải thông tin đơn hàng...
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <style>{OrderDetailAdminPageStyles}</style>
        <div className="admin-container">
          <div className="admin-header">
            <button 
              onClick={() => navigate('/admin/warehouse-orders')}
              className="admin-btn admin-btn-outline"
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
          </div>
          <div className="admin-card">
            <div className="admin-card-content">
              <div className="text-center py-8">
                <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy đơn hàng</h3>
                <p className="text-gray-600 mb-4">{error || 'Đơn hàng không tồn tại hoặc đã bị xóa'}</p>
                <button 
                  onClick={() => navigate('/admin/warehouse-orders')}
                  className="admin-btn admin-btn-primary"
                >
                  Quay lại danh sách đơn hàng
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{OrderDetailAdminPageStyles}</style>
      <div className="admin-container">
        {/* Header */}
        <div className="order-detail-header">
          <button 
            onClick={() => navigate('/admin/warehouse-orders')}
            className="back-button"
          >
            <ArrowLeft size={18} />
            Quay lại
          </button>
          <div className="order-header-info">
            <h1>Đơn hàng #{order.id?.toString().substring(0, 8) || 'N/A'}</h1>
            <span className={`order-status-badge ${getStatusClass(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="order-detail-content">
          {/* Left Column */}
          <div className="order-left-column">
            {/* Thông tin đơn hàng */}
            <div className="info-card">
              <div className="card-header">
                <Package size={20} />
                <h3>Thông tin đơn hàng</h3>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <Calendar size={16} />
                    <div>
                      <span className="label">Ngày đặt hàng</span>
                      <span className="value">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <Package size={16} />
                    <div>
                      <span className="label">Mã đơn hàng</span>
                      <span className="value">#{order.id}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <CreditCard size={16} />
                    <div>
                      <span className="label">Phương thức thanh toán</span>
                      <span className="value">{getPaymentMethodText(order.paymentMethod)}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="payment-status-item">
                      <span className="label">Trạng thái thanh toán</span>
                      <span className={`payment-status ${
                        order.paymentStatus === 'completed' ? 'completed' :
                        order.paymentStatus === 'pending' ? 'pending' :
                        'failed'
                      }`}>
                        {order.paymentStatus === 'completed' ? 'Đã thanh toán' :
                         order.paymentStatus === 'pending' ? 'Chờ thanh toán' :
                         order.paymentStatus === 'failed' ? 'Thanh toán thất bại' :
                         order.paymentStatus || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="total-amount">
                  <span className="total-label">Tổng tiền:</span>
                  <span className="total-value">{formatCurrency(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="info-card">
              <div className="card-header">
                <User size={20} />
                <h3>Thông tin khách hàng</h3>
              </div>
              <div className="card-content">
                <div className="customer-info">
                  <div className="customer-details">
                    <div className="detail-item">
                      <span className="label">Họ và tên:</span>
                      <span className="value">{order.user?.fullName || order.user?.name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span>
                      <span className="value">{order.user?.email || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Số điện thoại:</span>
                      <span className="value">{order.user?.phone || order.shippingAddress?.phone || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="shipping-address">
                    <div className="address-header">
                      <MapPin size={16} />
                      <span>Địa chỉ giao hàng</span>
                    </div>
                    <div className="address-content">
                      <div className="address-name">{order.shippingAddress?.fullName || 'N/A'}</div>
                      <div className="address-phone">{order.shippingAddress?.phone || 'N/A'}</div>
                      <div className="address-text">{order.shippingAddress?.address || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="order-right-column">
            {/* Danh sách sản phẩm */}
            <div className="info-card">
              <div className="card-header">
                <Package size={20} />
                <h3>Sản phẩm ({order.items?.length || 0})</h3>
              </div>
              <div className="card-content">
                <div className="products-list">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={index} className="product-item">
                        <div className="product-info">
                          <h4 className="product-title">{item.bookTitle || 'N/A'}</h4>
                          <p className="product-id">Mã: {item.bookId || 'N/A'}</p>
                        </div>
                        <div className="product-pricing">
                          <div className="price-line">
                            <span>{formatCurrency(item.price)} × {item.quantity}</span>
                          </div>
                          <div className="subtotal">
                            {formatCurrency((item.price || 0) * (item.quantity || 0))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-products">Không có sản phẩm nào</div>
                  )}
                </div>
              </div>
            </div>

            {/* Cập nhật trạng thái */}
            <div className="info-card">
              <div className="card-header">
                <Truck size={20} />
                <h3>Cập nhật trạng thái</h3>
              </div>
              <div className="card-content">
                <div className="status-actions">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus('confirmed')}
                      disabled={updating}
                      className="status-btn confirm-btn"
                    >
                      <Check size={16} />
                      {updating ? 'Đang cập nhật...' : 'Xác nhận đơn hàng'}
                    </button>
                  )}
                  
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus('processing')}
                      disabled={updating}
                      className="status-btn process-btn"
                    >
                      <Package size={16} />
                      {updating ? 'Đang cập nhật...' : 'Bắt đầu xử lý'}
                    </button>
                  )}
                  
                  {order.status === 'processing' && (
                    <button
                      onClick={() => handleUpdateStatus('shipped')}
                      disabled={updating}
                      className="status-btn ship-btn"
                    >
                      <Truck size={16} />
                      {updating ? 'Đang cập nhật...' : 'Giao cho vận chuyển'}
                    </button>
                  )}
                  
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => handleUpdateStatus('delivered')}
                      disabled={updating}
                      className="status-btn deliver-btn"
                    >
                      <Check size={16} />
                      {updating ? 'Đang cập nhật...' : 'Xác nhận đã giao'}
                    </button>
                  )}
                  
                  {['pending', 'confirmed', 'processing'].includes(order.status) && (
                    <button
                      onClick={() => handleUpdateStatus('cancelled')}
                      disabled={updating}
                      className="status-btn cancel-btn"
                    >
                      <X size={16} />
                      {updating ? 'Đang cập nhật...' : 'Hủy đơn hàng'}
                    </button>
                  )}
                  
                  <button
                    onClick={fetchOrderDetail}
                    disabled={updating}
                    className="status-btn refresh-btn"
                  >
                    <RefreshCw size={16} />
                    Làm mới
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}