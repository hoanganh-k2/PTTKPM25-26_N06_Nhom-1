import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import orderService from "../services/order.service";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Thông tin giao hàng, 2: Xác nhận đơn hàng
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    // Billing address
    billingFullName: '',
    billingPhone: '',
    billingAddress: '',
    paymentMethod: 'cash_on_delivery',
    useSameAddress: true,
    notes: ''
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Nếu giỏ hàng trống, redirect về trang giỏ hàng
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    
    // Validate billing address nếu không dùng cùng địa chỉ
    if (!formData.useSameAddress) {
      if (!formData.billingFullName.trim()) {
        newErrors.billingFullName = 'Vui lòng nhập họ tên người nhận hóa đơn';
      }
      if (!formData.billingPhone.trim()) {
        newErrors.billingPhone = 'Vui lòng nhập số điện thoại';
      }
      if (!formData.billingAddress.trim()) {
        newErrors.billingAddress = 'Vui lòng nhập địa chỉ thanh toán';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateForm()) {
      setStep(2);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Chuẩn bị dữ liệu đơn hàng
      const shippingAddress = {
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address
      };

      const billingAddress = formData.useSameAddress ? shippingAddress : {
        fullName: formData.billingFullName,
        phone: formData.billingPhone,
        address: formData.billingAddress
      };

      const orderData = {
        items: cartItems.map(item => ({
          bookId: item.id,
          quantity: item.quantity
        })),
        shippingAddress,
        billingAddress,
        paymentMethod: formData.paymentMethod
      };

      console.log('Sending order data:', orderData); // Debug log
      
      // Tạo đơn hàng
      const response = await orderService.createOrder(orderData);
      
      // Clear giỏ hàng
      clearCart();
      
      // Redirect đến trang thành công
      navigate('/order-success', { 
        state: { 
          orderId: response.id,
          orderData: response 
        } 
      });
      
    } catch (error) {
      console.error('Lỗi khi đặt hàng:', error);
      alert(error.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return null; // Component sẽ redirect về cart
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Đặt hàng</h1>
          <div className="checkout-steps">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Thông tin giao hàng</span>
            </div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Xác nhận đơn hàng</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">
            {step === 1 && (
              <div className="shipping-form">
                <h2>Thông tin giao hàng</h2>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Họ và tên *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={errors.fullName ? 'error' : ''}
                      placeholder="Nhập họ và tên"
                    />
                    {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Số điện thoại *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                      placeholder="Nhập số điện thoại"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Nhập địa chỉ email"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="address">Địa chỉ *</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={errors.address ? 'error' : ''}
                    placeholder="Nhập địa chỉ đầy đủ"
                    rows={3}
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="useSameAddress"
                      checked={formData.useSameAddress}
                      onChange={handleInputChange}
                    />
                    Địa chỉ thanh toán giống địa chỉ giao hàng
                  </label>
                </div>

                {!formData.useSameAddress && (
                  <div className="billing-address-section">
                    <h3>Địa chỉ thanh toán</h3>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="billingFullName">Họ và tên *</label>
                        <input
                          type="text"
                          id="billingFullName"
                          name="billingFullName"
                          value={formData.billingFullName}
                          onChange={handleInputChange}
                          className={errors.billingFullName ? 'error' : ''}
                          placeholder="Nhập họ và tên"
                        />
                        {errors.billingFullName && <span className="error-message">{errors.billingFullName}</span>}
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="billingPhone">Số điện thoại *</label>
                        <input
                          type="tel"
                          id="billingPhone"
                          name="billingPhone"
                          value={formData.billingPhone}
                          onChange={handleInputChange}
                          className={errors.billingPhone ? 'error' : ''}
                          placeholder="Nhập số điện thoại"
                        />
                        {errors.billingPhone && <span className="error-message">{errors.billingPhone}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="billingAddress">Địa chỉ *</label>
                      <textarea
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        className={errors.billingAddress ? 'error' : ''}
                        placeholder="Nhập địa chỉ đầy đủ"
                        rows={3}
                      />
                      {errors.billingAddress && <span className="error-message">{errors.billingAddress}</span>}
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="paymentMethod">Phương thức thanh toán</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="cash_on_delivery">Thanh toán khi nhận hàng (COD)</option>
                    <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                    <option value="credit_card">Thẻ tín dụng</option>
                    <option value="debit_card">Thẻ ghi nợ</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Ghi chú (tùy chọn)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Ghi chú về đơn hàng (nếu có)"
                    rows={3}
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="back-button"
                    onClick={() => navigate('/cart')}
                  >
                    Quay lại giỏ hàng
                  </button>
                  <button 
                    type="button" 
                    className="next-button"
                    onClick={handleNextStep}
                  >
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="confirmation-form">
                <h2>Xác nhận đơn hàng</h2>
                
                <div className="confirmation-section">
                  <h3>Thông tin giao hàng</h3>
                  <div className="info-display">
                    <p><strong>Họ tên:</strong> {formData.fullName}</p>
                    <p><strong>Điện thoại:</strong> {formData.phone}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Địa chỉ:</strong> {formData.address}</p>
                    <p><strong>Phương thức thanh toán:</strong> {
                      formData.paymentMethod === 'cash_on_delivery' ? 'Thanh toán khi nhận hàng' :
                      formData.paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                      formData.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' :
                      formData.paymentMethod === 'debit_card' ? 'Thẻ ghi nợ' :
                      formData.paymentMethod === 'paypal' ? 'PayPal' :
                      formData.paymentMethod
                    }</p>
                    {formData.notes && <p><strong>Ghi chú:</strong> {formData.notes}</p>}
                  </div>
                  <button 
                    type="button" 
                    className="edit-button"
                    onClick={() => setStep(1)}
                  >
                    Chỉnh sửa
                  </button>
                </div>

                <div className="confirmation-section">
                  <h3>Đơn hàng của bạn</h3>
                  <div className="order-items">
                    {cartItems.map(item => (
                      <div key={item.id} className="order-item">
                        <img 
                          src={item.coverImage || "https://placehold.co/100x150"} 
                          alt={item.title}
                          className="order-item-image"
                        />
                        <div className="order-item-details">
                          <h4>{item.title}</h4>
                          <p className="order-item-price">
                            {item.price?.toLocaleString('vi-VN')} ₫ x {item.quantity}
                          </p>
                          <p className="order-item-subtotal">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-total">
                    <div className="total-row">
                      <span>Tạm tính:</span>
                      <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="total-row">
                      <span>Phí vận chuyển:</span>
                      <span>0 ₫</span>
                    </div>
                    <div className="total-row final">
                      <span>Tổng cộng:</span>
                      <span>{totalAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="back-button"
                    onClick={() => setStep(1)}
                  >
                    Quay lại
                  </button>
                  <button 
                    type="button" 
                    className="place-order-button"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}