import api from "./api";

// Cart and order service functions
const orderService = {
  // Lấy thông tin giỏ hàng
  getCart: async () => {
    try {
      const response = await api.get("/cart");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy thông tin giỏ hàng",
        }
      );
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  addToCart: async (bookId, quantity = 1) => {
    try {
      const response = await api.post("/cart/items", { bookId, quantity });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng",
        }
      );
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  updateCartItem: async (cartItemId, quantity) => {
    try {
      const response = await api.put(`/cart/items/${cartItemId}`, { quantity });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi cập nhật số lượng sản phẩm",
        }
      );
    }
  },

  // Xóa sản phẩm khỏi giỏ hàng
  removeFromCart: async (cartItemId) => {
    try {
      const response = await api.delete(`/cart/items/${cartItemId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng",
        }
      );
    }
  },

  // Xóa tất cả sản phẩm trong giỏ hàng
  clearCart: async () => {
    try {
      const response = await api.delete("/cart/items");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Có lỗi xảy ra khi xóa giỏ hàng" }
      );
    }
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const response = await api.post("/orders", orderData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Có lỗi xảy ra khi tạo đơn hàng" }
      );
    }
  },

  // Lấy tất cả đơn hàng (dành cho Admin)
  getAllOrders: async (params = {}) => {
    try {
      const response = await api.get("/orders/admin", { params });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy tất cả đơn hàng",
        }
      );
    }
  },
  
  // Lấy danh sách đơn hàng của người dùng hiện tại
  getUserOrders: async (params = {}) => {
    try {
      const response = await api.get("/orders", { params });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy danh sách đơn hàng",
        }
      );
    }
  },

  // Lấy chi tiết đơn hàng theo ID
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy chi tiết đơn hàng",
        }
      );
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId, reason = '') => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Có lỗi xảy ra khi hủy đơn hàng" }
      );
    }
  },
  
  // Cập nhật trạng thái đơn hàng (Admin)
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi cập nhật trạng thái đơn hàng",
        }
      );
    }
  },
  
  // Lấy thống kê đơn hàng (Admin)
  getOrderStatistics: async (period = 'month') => {
    try {
      const response = await api.get('/orders/statistics', { params: { period } });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy thống kê đơn hàng",
        }
      );
    }
  },
};

export default orderService;
