import api from "./api";

// User management service (Admin)
const userService = {
  // Lấy danh sách tất cả người dùng (Admin)
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get("/users", { params });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy danh sách người dùng",
        }
      );
    }
  },

  // Lấy thông tin người dùng theo ID (Admin)
  getUserById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy thông tin người dùng",
        }
      );
    }
  },

  // Tạo người dùng mới (Admin)
  createUser: async (userData) => {
    try {
      const response = await api.post("/users", userData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi tạo người dùng mới",
        }
      );
    }
  },

  // Cập nhật thông tin người dùng (Admin)
  updateUser: async (id, userData) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi cập nhật thông tin người dùng",
        }
      );
    }
  },

  // Xóa/vô hiệu hóa người dùng (Admin)
  deactivateUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi vô hiệu hóa người dùng",
        }
      );
    }
  },

  // Kích hoạt lại người dùng đã bị vô hiệu hóa (Admin)
  activateUser: async (id) => {
    try {
      const response = await api.patch(`/users/${id}/activate`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi kích hoạt người dùng",
        }
      );
    }
  },

  // Đặt lại mật khẩu người dùng (Admin)
  resetUserPassword: async (id) => {
    try {
      const response = await api.post(`/users/${id}/reset-password`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi đặt lại mật khẩu",
        }
      );
    }
  },

  // Lấy thống kê người dùng (Admin)
  getUserStatistics: async () => {
    try {
      const response = await api.get("/users/statistics");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy thống kê người dùng",
        }
      );
    }
  }
};

export default userService;
