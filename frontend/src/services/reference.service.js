import api from "./api";

// Reference data service cho các dữ liệu tham chiếu như categories, authors, publishers
const referenceService = {
  // Lấy tất cả categories, authors, publishers để sử dụng trong forms
  getAllReferenceData: async () => {
    try {
      // Gọi API để lấy tất cả dữ liệu tham chiếu cần thiết
      const [categoriesRes, authorsRes, publishersRes] = await Promise.all([
        api.get("/books/categories").catch(() => ({ data: [] })), // Fallback nếu endpoint không tồn tại
        api.get("/books/authors").catch(() => ({ data: [] })),
        api.get("/books/publishers").catch(() => ({ data: [] }))
      ]);

      return {
        categories: categoriesRes.data || [],
        authors: authorsRes.data || [],
        publishers: publishersRes.data || []
      };
    } catch (error) {
      console.warn('Lỗi khi lấy dữ liệu tham chiếu, sử dụng dữ liệu mặc định:', error);
      
      // Trả về dữ liệu mặc định nếu API chưa có
      return {
        categories: [
          { id: '50a1972c-5f02-4e0e-acc3-16fd31001786', name: 'Thiếu nhi' },
          { id: '7f157deb-e6a2-4bc3-92ab-d060f37ff7d5', name: 'Tiểu thuyết' },
          { id: '99431bb7-bafa-4cf3-9f80-c843e9b2c306', name: 'Kinh tế' },
          { id: 'c13fd8a-c1e5-436d-a9cb-6a79496025e1', name: 'Tự lực' }
        ],
        authors: [
          { id: '177444f8-5ab2-4daf-a603-608f9bdd91bc', name: 'Nguyễn Nhật Ánh' },
          { id: '3f7c90c8-d805-4c2b-a4b4-c48f452bd7f9', name: 'Tô Hoài' },
          { id: '58985d41-f7a8-467c-82cc-79b598ebdcfd', name: 'Dale Carnegie' },
          { id: '60a7e708-745b-4240-9935-8b39d92dc8f0', name: 'Paulo Coelho' }
        ],
        publishers: [
          { id: '33c5704f-0c77-4df8-b56d-5e19625d462e', name: 'First News' },
          { id: 'c8e1390c-776a-41f7-a503-98aa96d7b9b6', name: 'NXB Trẻ' },
          { id: 'f99cd6b2-d649-4637-a8ff-850e18dac9b0', name: 'NXB Kim Đồng' }
        ]
      };
    }
  }
};

export default referenceService;