import api from "./api";
import referenceService from "./reference.service";

// Publisher service functions
const publisherService = {
  // Lấy tất cả nhà xuất bản
  getAllPublishers: async (params = {}) => {
    try {
      const response = await api.get("/publishers", { params });
      return response.data;
    } catch (error) {
      console.warn('API /publishers không khả dụng, sử dụng dữ liệu tham chiếu:', error);
      
      // Fallback sử dụng reference service
      const referenceData = await referenceService.getAllReferenceData();
      return { publishers: referenceData.publishers };
    }
  },

  // Lấy nhà xuất bản theo ID
  getPublisherById: async (id) => {
    try {
      const response = await api.get(`/publishers/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi lấy thông tin nhà xuất bản",
        }
      );
    }
  },

  // Tạo nhà xuất bản mới (Admin)
  createPublisher: async (publisherData) => {
    try {
      const response = await api.post("/publishers", publisherData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi tạo nhà xuất bản mới",
        }
      );
    }
  },

  // Cập nhật nhà xuất bản (Admin)
  updatePublisher: async (id, publisherData) => {
    try {
      const response = await api.put(`/publishers/${id}`, publisherData);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi cập nhật thông tin nhà xuất bản",
        }
      );
    }
  },

  // Xóa nhà xuất bản (Admin)
  deletePublisher: async (id) => {
    try {
      const response = await api.delete(`/publishers/${id}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || {
          message: "Có lỗi xảy ra khi xóa nhà xuất bản",
        }
      );
    }
  },
};

export default publisherService;