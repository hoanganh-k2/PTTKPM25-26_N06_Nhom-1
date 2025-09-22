import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import orderService from '../services/order.service';

// Tạo context cho giỏ hàng
const CartContext = createContext();

// Custom hook để sử dụng CartContext
export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  // State cho giỏ hàng
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false); // For initial load
  const [updating, setUpdating] = useState(false); // For updates

  // Cache và optimizations
  const loadingRef = useRef(false);
  const lastLoadTime = useRef(0);
  const CACHE_TTL = 60000; // 1 minute cache

  // Load giỏ hàng từ API khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      loadCart();
    } else {
      // Clear cart when user logs out
      setCartItems([]);
      setTotalItems(0);
      setTotalAmount(0);
    }
  }, [isAuthenticated, currentUser]);

  // Load giỏ hàng từ server với cache
  const loadCart = useCallback(async (forceReload = false) => {
    if (!isAuthenticated || loadingRef.current) {
      return;
    }
    
    // Kiểm tra cache
    const now = Date.now();
    if (!forceReload && (now - lastLoadTime.current) < CACHE_TTL) {
      return; // Sử dụng data từ cache
    }
    
    try {
      setLoading(true);
      loadingRef.current = true;
      
      const cartData = await orderService.getCart();
      
      // Check if cartData is valid
      if (!cartData || !cartData.items) {
        setCartItems([]);
        setTotalItems(0);
        setTotalAmount(0);
        return;
      }
      
      // Transform API response to match current cart structure
      const transformedItems = cartData.items.map(item => ({
        id: item.book.id,
        cartItemId: item.id, // ID của cart item trong database
        title: item.book.title,
        price: item.book.price,
        coverImage: item.book.coverImage,
        quantity: item.quantity,
        stock: item.book.stock
      }));
      
      setCartItems(transformedItems);
      setTotalItems(cartData.totalItems);
      setTotalAmount(cartData.totalAmount);
      
      // Update cache timestamp
      lastLoadTime.current = now;
    } catch (error) {
      console.error('Error loading cart:', error);
      // Fallback to empty cart on error
      setCartItems([]);
      setTotalItems(0);
      setTotalAmount(0);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [isAuthenticated]);

  // Thêm sản phẩm vào giỏ hàng với optimistic updates
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    // Optimistic update - update UI immediately
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);
    let optimisticItems = [...cartItems];
    
    if (existingItemIndex !== -1) {
      optimisticItems[existingItemIndex].quantity += quantity;
    } else {
      optimisticItems.push({
        id: product.id,
        cartItemId: null, // Will be updated from API response
        title: product.title,
        price: product.price,
        coverImage: product.coverImage,
        quantity: quantity,
        stock: product.stock
      });
    }
    
    // Calculate optimistic totals
    const optimisticTotalItems = optimisticItems.reduce((sum, item) => sum + item.quantity, 0);
    const optimisticTotalAmount = optimisticItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update UI optimistically
    setCartItems(optimisticItems);
    setTotalItems(optimisticTotalItems);
    setTotalAmount(optimisticTotalAmount);

    try {
      setUpdating(true);
      const response = await orderService.addToCart(product.id, quantity);
      
      // Update with real data from server
      if (response && response.items) {
        const transformedItems = response.items.map(item => ({
          id: item.book.id,
          cartItemId: item.id,
          title: item.book.title,
          price: item.book.price,
          coverImage: item.book.coverImage,
          quantity: item.quantity,
          stock: item.book.stock
        }));
        
        setCartItems(transformedItems);
        setTotalItems(response.totalItems);
        setTotalAmount(response.totalAmount);
        
        // Update cache timestamp
        lastLoadTime.current = Date.now();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Revert optimistic update on error
      await loadCart();
      alert(error.message || 'Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
    } finally {
      setUpdating(false);
    }
  }, [isAuthenticated, cartItems, loadCart]);

  // Xóa sản phẩm khỏi giỏ hàng với optimistic updates
  const removeFromCart = useCallback(async (productId) => {
    if (!isAuthenticated) return;

    // Optimistic update - remove item immediately
    const optimisticItems = cartItems.filter(item => item.id !== productId);
    const optimisticTotalItems = optimisticItems.reduce((sum, item) => sum + item.quantity, 0);
    const optimisticTotalAmount = optimisticItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update UI optimistically
    setCartItems(optimisticItems);
    setTotalItems(optimisticTotalItems);
    setTotalAmount(optimisticTotalAmount);

    try {
      setUpdating(true);
      // Find cart item ID
      const cartItem = cartItems.find(item => item.id === productId);
      if (cartItem && cartItem.cartItemId) {
        const response = await orderService.removeFromCart(cartItem.cartItemId);
        
        // Update state directly from response
        if (response && response.items) {
          const transformedItems = response.items.map(item => ({
            id: item.book.id,
            cartItemId: item.id,
            title: item.book.title,
            price: item.book.price,
            coverImage: item.book.coverImage,
            quantity: item.quantity,
            stock: item.book.stock
          }));
          
          setCartItems(transformedItems);
          setTotalItems(response.totalItems);
          setTotalAmount(response.totalAmount);
          
          // Update cache timestamp
          lastLoadTime.current = Date.now();
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Revert optimistic update on error
      await loadCart();
      alert(error.message || 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng');
    } finally {
      setUpdating(false);
    }
  }, [isAuthenticated, cartItems, loadCart]);

  // Cập nhật số lượng sản phẩm trong giỏ hàng với optimistic updates
  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!isAuthenticated) return;
    
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    // Optimistic update - update quantity immediately
    const optimisticItems = cartItems.map(item => 
      item.id === productId ? { ...item, quantity } : item
    );
    const optimisticTotalItems = optimisticItems.reduce((sum, item) => sum + item.quantity, 0);
    const optimisticTotalAmount = optimisticItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update UI optimistically
    setCartItems(optimisticItems);
    setTotalItems(optimisticTotalItems);
    setTotalAmount(optimisticTotalAmount);
    
    try {
      setUpdating(true);
      // Find cart item ID
      const cartItem = cartItems.find(item => item.id === productId);
      if (cartItem && cartItem.cartItemId) {
        const response = await orderService.updateCartItem(cartItem.cartItemId, quantity);
        
        // Update state directly from response
        if (response && response.items) {
          const transformedItems = response.items.map(item => ({
            id: item.book.id,
            cartItemId: item.id,
            title: item.book.title,
            price: item.book.price,
            coverImage: item.book.coverImage,
            quantity: item.quantity,
            stock: item.book.stock
          }));
          
          setCartItems(transformedItems);
          setTotalItems(response.totalItems);
          setTotalAmount(response.totalAmount);
          
          // Update cache timestamp
          lastLoadTime.current = Date.now();
        }
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      // Revert optimistic update on error
      await loadCart();
      alert(error.message || 'Có lỗi xảy ra khi cập nhật số lượng sản phẩm');
    } finally {
      setUpdating(false);
    }
  }, [isAuthenticated, cartItems, removeFromCart, loadCart]);

  // Xóa toàn bộ giỏ hàng với optimistic updates
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) return;

    // Optimistic update - clear immediately
    setCartItems([]);
    setTotalItems(0);
    setTotalAmount(0);

    try {
      setUpdating(true);
      const response = await orderService.clearCart();
      
      // Update state directly from response (should be empty)
      if (response) {
        setCartItems([]);
        setTotalItems(0);
        setTotalAmount(0);
        
        // Update cache timestamp
        lastLoadTime.current = Date.now();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Revert optimistic update on error
      await loadCart();
      alert(error.message || 'Có lỗi xảy ra khi xóa giỏ hàng');
    } finally {
      setUpdating(false);
    }
  }, [isAuthenticated, loadCart]);

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
    loading, // For initial page load
    updating, // For individual actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    loadCart, // Expose loadCart for manual refresh
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;