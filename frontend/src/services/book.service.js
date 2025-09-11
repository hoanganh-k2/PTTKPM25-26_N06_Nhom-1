import api from "./api";

// Book service functions
const bookService = {
  // Lấy tất cả sách
  getAllBooks: async (params = {}) => {
    try {
      const response = await api.get("/books", { params });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy danh sách sách",
        }
      );
    }
  },

  // Lấy sách theo ID
  getBookById: async (id) => {
    try {
      const response = await api.get(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy thông tin sách",
        }
      );
    }
  },
  
  // Tạo sách mới (Admin)
  createBook: async (bookData) => {
    try {
      const response = await api.post("/books", bookData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi tạo sách mới",
        }
      );
    }
  },

  // Cập nhật sách (Admin)
  updateBook: async (id, bookData) => {
    try {
      const response = await api.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi cập nhật thông tin sách",
        }
      );
    }
  },

  // Xóa sách (Admin)
  deleteBook: async (id) => {
    try {
      const response = await api.delete(`/books/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi xóa sách",
        }
      );
    }
  },

  // Lấy sách theo thể loại
  getBooksByCategory: async (categoryId, params = {}) => {
    try {
      const response = await api.get(`/categories/${categoryId}/books`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy sách theo thể loại",
        }
      );
    }
  },

  // Lấy sách mới nhất
  getLatestBooks: async (limit = 8) => {
    try {
      const response = await api.get("/books/latest", { params: { limit } });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy sách mới nhất",
        }
      );
    }
  },

  // Lấy sách bán chạy
  getBestsellerBooks: async (limit = 8) => {
    try {
      const response = await api.get("/books/bestseller", {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy sách bán chạy",
        }
      );
    }
  },

  // Tìm kiếm sách
  searchBooks: async (query, params = {}) => {
    try {
      const response = await api.get("/books/search", {
        params: {
          query,
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Có lỗi xảy ra khi tìm kiếm sách" }
      );
    }
  },

  // Lấy danh sách thể loại
  getAllCategories: async () => {
    try {
      const response = await api.get("/categories");
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy danh sách thể loại",
        }
      );
    }
  },
};

export default bookService;
