import api from "./api";
import referenceService from "./reference.service";

// Author service functions
const authorService = {
  // Lấy tất cả tác giả
  getAllAuthors: async (params = {}) => {
    try {
      const response = await api.get("/authors", { params });
      return response.data;
    } catch (error) {
      console.warn('API /authors không khả dụng, sử dụng dữ liệu tham chiếu:', error);
      
      // Fallback sử dụng reference service
      const referenceData = await referenceService.getAllReferenceData();
      return { authors: referenceData.authors };
    }
  },

  // Lấy tác giả theo ID
  getAuthorById: async (id) => {
    try {
      const response = await api.get(`/authors/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy thông tin tác giả",
        }
      );
    }
  },

  // Tạo tác giả mới (Admin)
  createAuthor: async (authorData) => {
    try {
      const response = await api.post("/authors", authorData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi tạo tác giả mới",
        }
      );
    }
  },

  // Cập nhật tác giả (Admin)
  updateAuthor: async (id, authorData) => {
    try {
      const response = await api.put(`/authors/${id}`, authorData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi cập nhật thông tin tác giả",
        }
      );
    }
  },

  // Xóa tác giả (Admin)
  deleteAuthor: async (id) => {
    try {
      const response = await api.delete(`/authors/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi xóa tác giả",
        }
      );
    }
  },
};

export default authorService;