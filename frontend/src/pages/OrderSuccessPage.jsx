import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./OrderSuccessPage.css";

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderData } = location.state || {};

  useEffect(() => {
    // Nếu không có thông tin đơn hàng, redirect về home
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-content">
          <div className="success-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#4CAF50" strokeWidth="2"/>
              <path d="m9 12 2 2 4-4" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <h1 className="success-title">Đặt hàng thành công!</h1>
          
          <p className="success-message">
            Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được ghi nhận và sẽ được xử lý trong thời gian sớm nhất.
          </p>
          
          <div className="order-info">
            <h2>Thông tin đơn hàng</h2>
            <div className="order-details">
              <div className="detail-row">
                <span className="detail-label">Mã đơn hàng:</span>
                <span className="detail-value">#{orderId}</span>
              </div>
              
              {orderData && (
                <>
                  <div className="detail-row">
                    <span className="detail-label">Tổng tiền:</span>
                    <span className="detail-value">{orderData.totalAmount?.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Phương thức thanh toán:</span>
                    <span className="detail-value">
                      {orderData.paymentMethod === 'cash_on_delivery' ? 'Thanh toán khi nhận hàng' :
                       orderData.paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                       orderData.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' :
                       orderData.paymentMethod === 'debit_card' ? 'Thẻ ghi nợ' :
                       orderData.paymentMethod === 'paypal' ? 'PayPal' :
                       orderData.paymentMethod}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Trạng thái:</span>
                    <span className="detail-value">Đang xử lý</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="next-steps">
            <h3>Các bước tiếp theo:</h3>
            <ul>
              <li>Chúng tôi sẽ gửi email xác nhận đơn hàng đến địa chỉ email của bạn</li>
              <li>Đơn hàng sẽ được xử lý và đóng gói trong 1-2 ngày làm việc</li>
              <li>Bạn sẽ nhận được thông báo khi đơn hàng được giao cho đơn vị vận chuyển</li>
              <li>Thời gian giao hàng dự kiến: 2-5 ngày làm việc</li>
            </ul>
          </div>
          
          <div className="action-buttons">
            <Link to="/orders" className="view-orders-button">
              Xem đơn hàng của tôi
            </Link>
            <Link to="/books" className="continue-shopping-button">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}