import { createContext, useState, useContext, useEffect } from 'react';

// Tạo context cho giỏ hàng
const CartContext = createContext();

// Custom hook để sử dụng CartContext
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  // Lấy giỏ hàng từ localStorage nếu có
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Tổng số sản phẩm trong giỏ hàng
  const [totalItems, setTotalItems] = useState(0);
  
  // Tổng tiền trong giỏ hàng
  const [totalAmount, setTotalAmount] = useState(0);

  // Cập nhật localStorage khi cartItems thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Tính tổng số lượng
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    setTotalItems(itemCount);
    
    // Tính tổng tiền
    const amount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    setTotalAmount(amount);
  }, [cartItems]);

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Nếu sản phẩm đã có trong giỏ, tăng số lượng
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Nếu sản phẩm chưa có trong giỏ, thêm mới
        return [...prevItems, {
          id: product.id,
          title: product.title,
          price: product.price,
          coverImage: product.coverImage,
          quantity: quantity,
          stock: product.stock
        }];
      }
    });
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === productId) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setCartItems([]);
  };

  // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  // Lấy số lượng sản phẩm trong giỏ hàng
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  // Giá trị cung cấp cho context
  const value = {
    cartItems,
    totalItems,
    totalAmount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;