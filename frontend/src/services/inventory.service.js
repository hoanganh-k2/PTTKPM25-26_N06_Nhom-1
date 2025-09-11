import api from "./api";

// Inventory service functions
const inventoryService = {
  // Lấy thông tin tồn kho
  getInventory: async (params = {}) => {
    try {
      const response = await api.get("/inventory", { params });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy thông tin tồn kho",
        }
      );
    }
  },

  // Cập nhật số lượng tồn kho cho một sách
  updateStock: async (bookId, stock) => {
    try {
      const response = await api.put(`/inventory/update-stock/${bookId}`, { stock });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi cập nhật tồn kho",
        }
      );
    }
  },

  // Xác nhận đơn hàng
  confirmOrder: async (orderId) => {
    try {
      const response = await api.post(`/inventory/confirm-order/${orderId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi xác nhận đơn hàng",
        }
      );
    }
  },

  // Lấy thông tin các đơn hàng đang chờ xử lý
  getPendingOrders: async (params = {}) => {
    try {
      // Đặt mặc định trạng thái là 'pending'
      const defaultParams = { status: 'pending', ...params };
      const response = await api.get("/orders", { params: defaultParams });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy đơn hàng chờ xử lý",
        }
      );
    }
  },
};

export default inventoryService;
