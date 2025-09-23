import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import "./CartPage.css";

// Debounce function
function useDebounce(func, delay) {
  const [debounceTimer, setDebounceTimer] = useState(null);
  
  return useCallback((...args) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    const newTimer = setTimeout(() => {
      func(...args);
    }, delay);
    
    setDebounceTimer(newTimer);
  }, [func, delay, debounceTimer]);
}

export default function CartPage() {
  const { cartItems, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart, loading, updating } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Giỏ hàng, 2: Thông tin giao hàng, 3: Thanh toán

  // Debounced update quantity function
  const debouncedUpdateQuantity = useDebounce(updateQuantity, 500);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      if (window.confirm("Bạn có muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
        removeFromCart(productId);
      }
    } else {
      // Use debounced version for input changes
      debouncedUpdateQuantity(productId, newQuantity);
    }
  };

  const handleRemove = (productId, title) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${title}" khỏi giỏ hàng không?`)) {
      removeFromCart(productId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng không?")) {
      clearCart();
    }
  };

  const handleProceedToCheckout = () => {
    // Chuyển đến trang checkout
    navigate('/checkout');
  };

  // Kiểm tra nếu người dùng chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">Giỏ hàng của bạn</h1>
        <div className="empty-cart">
          <div className="empty-cart-icon">🔒</div>
          <p className="empty-cart-message">Vui lòng đăng nhập để xem giỏ hàng</p>
          <p className="empty-cart-suggestion">Đăng nhập để thêm sản phẩm vào giỏ hàng và tiếp tục mua sắm</p>
          <Link to="/login" className="continue-shopping-button">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">Giỏ hàng của bạn</h1>
        <div className="empty-cart">
          <div className="empty-cart-icon">⏳</div>
          <p className="empty-cart-message">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">Giỏ hàng của bạn</h1>
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <p className="empty-cart-message">Giỏ hàng của bạn đang trống</p>
          <p className="empty-cart-suggestion">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <Link to="/books" className="continue-shopping-button">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Giỏ hàng của bạn</h1>
      
      {/* Show updating indicator */}
      {updating && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: '#f0f0f0',
          padding: '8px 16px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          fontSize: '14px',
          zIndex: 1000
        }}>
          Đang cập nhật...
        </div>
      )}
      
      <div className="cart-container">
        <div className="cart-items-container">
          <div className="cart-header">
            <div className="cart-header-product">Sản phẩm</div>
            <div className="cart-header-price">Đơn giá</div>
            <div className="cart-header-quantity">Số lượng</div>
            <div className="cart-header-total">Thành tiền</div>
            <div className="cart-header-actions">Thao tác</div>
          </div>

          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-product">
                <Link to={`/books/${item.id}`} className="cart-item-link">
                  <img 
                    src={item.coverImage || "https://placehold.co/600x900"} 
                    alt={item.title} 
                    className="cart-item-image" 
                  />
                  <div className="cart-item-details">
                    <h3 className="cart-item-title">{item.title}</h3>
                    <p className="cart-item-stock">
                      {item.stock > 0 ? `Còn ${item.stock} sản phẩm` : "Hết hàng"}
                    </p>
                  </div>
                </Link>
              </div>
              <div className="cart-item-price">
                {item.price?.toLocaleString('vi-VN')} ₫
              </div>
              <div className="cart-item-quantity">
                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={updating}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="quantity-input"
                    disabled={updating}
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock || updating}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="cart-item-total">
                {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
              </div>
              <div className="cart-item-actions">
                <button 
                  className="remove-button"
                  onClick={() => handleRemove(item.id, item.title)}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2 className="summary-title">Thông tin đơn hàng</h2>
          <div className="summary-details">
            <div className="summary-row">
              <span className="summary-label">Tổng sản phẩm:</span>
              <span className="summary-value">{totalItems}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Tạm tính:</span>
              <span className="summary-value">{totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Phí vận chuyển:</span>
              <span className="summary-value">0 ₫</span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">Tổng cộng:</span>
              <span className="summary-value total-amount">{totalAmount.toLocaleString('vi-VN')} ₫</span>
            </div>
          </div>
          <div className="summary-actions">
            <button className="checkout-button" onClick={handleProceedToCheckout}>
              Tiến hành đặt hàng
            </button>
            <Link to="/books" className="continue-shopping-link">
              Tiếp tục mua sắm
            </Link>
            <button className="clear-cart-button" onClick={handleClearCart}>
              Xóa giỏ hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}