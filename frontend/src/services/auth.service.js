import api from "./api";

// Authentication service functions
const authService = {
  // Đăng ký tài khoản
  register: async (userData) => {
    try {
      // Create a clean object with ONLY the required fields - nothing else
      const registerPayload = {
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        role: 'customer'
      };
      
      const response = await api.post("/auth/register", registerPayload);
      return response.data;
    } catch (error) {
      console.error("Registration API error:", error);
      
      // Improved error handling
      if (error.response && error.response.data) {
        throw error.response.data;
      } else {
        throw { message: "Có lỗi xảy ra khi đăng ký" };
      }
    }
  },

  // Đăng nhập
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      // Lưu token và thông tin user vào localStorage
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error("Login API error:", error);
      // Return the original error to enable better error handling in the component
      throw error;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra đã đăng nhập hay chưa
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Lấy token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi yêu cầu đặt lại mật khẩu",
        }
      );
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, password) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi đặt lại mật khẩu",
        }
      );
    }
  },
};

export default authService;
