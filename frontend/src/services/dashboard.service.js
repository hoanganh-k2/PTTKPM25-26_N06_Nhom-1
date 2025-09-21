import api from "./api";

// Dashboard service functions
const dashboardService = {
  // Lấy thống kê tổng quan dashboard
  getDashboardStats: async () => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy thống kê dashboard",
        }
      );
    }
  },

  // Lấy dữ liệu doanh thu theo thời gian
  getRevenueByPeriod: async (period = 'month') => {
    try {
      const response = await api.get(`/dashboard/revenue?period=${period}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy dữ liệu doanh thu",
        }
      );
    }
  }
};

export default dashboardService;