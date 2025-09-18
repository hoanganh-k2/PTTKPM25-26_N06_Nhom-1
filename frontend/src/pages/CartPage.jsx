import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import "./CartPage.css";

export default function CartPage() {
  const { cartItems, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Giỏ hàng, 2: Thông tin giao hàng, 3: Thanh toán

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      if (window.confirm("Bạn có muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
        removeFromCart(productId);
      }
    } else {
      updateQuantity(productId, newQuantity);
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
    // Trong pha đầu, chúng ta chỉ cần thông báo là đã đặt hàng thành công
    alert("Chức năng thanh toán sẽ được phát triển sau!");
  };

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
                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
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
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
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