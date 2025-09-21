import api from "./api";
import referenceService from "./reference.service";

// Category service functions
const categoryService = {
  // Lấy tất cả thể loại
  getAllCategories: async (params = {}) => {
    try {
      const response = await api.get("/categories", { params });
      return response.data;
    } catch (error) {
      console.warn('API /categories không khả dụng, sử dụng dữ liệu tham chiếu:', error);
      
      // Fallback sử dụng reference service
      const referenceData = await referenceService.getAllReferenceData();
      return { categories: referenceData.categories };
    }
  },

  // Lấy thể loại theo ID
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy thông tin thể loại",
        }
      );
    }
  },

  // Tạo thể loại mới (Admin)
  createCategory: async (categoryData) => {
    try {
      const response = await api.post("/categories", categoryData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi tạo thể loại mới",
        }
      );
    }
  },

  // Cập nhật thể loại (Admin)
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi cập nhật thông tin thể loại",
        }
      );
    }
  },

  // Xóa thể loại (Admin)
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/categories/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi xóa thể loại",
        }
      );
    }
  },
};

export default categoryService;