import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import bookService from '../../services/book.service';

export default function BooksManagementPage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [currentPage, selectedCategory]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      // Trong môi trường thực tế, bạn sẽ gọi API từ bookService
      // Ở đây chúng ta giả lập dữ liệu
      setTimeout(() => {
        const mockBooks = [
          { 
            id: '1', 
            title: 'Đắc Nhân Tâm', 
            author: { id: '1', name: 'Dale Carnegie' },
            price: 120000,
            stock: 50,
            categories: [{ id: '1', name: 'Tự lực' }],
            publishYear: 2016
          },
          { 
            id: '2', 
            title: 'Nhà Giả Kim', 
            author: { id: '2', name: 'Paulo Coelho' },
            price: 90000,
            stock: 40,
            categories: [{ id: '2', name: 'Tiểu thuyết' }],
            publishYear: 2020
          },
          { 
            id: '3', 
            title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', 
            author: { id: '3', name: 'Nguyễn Nhật Ánh' },
            price: 85000,
            stock: 35,
            categories: [{ id: '2', name: 'Tiểu thuyết' }, { id: '3', name: 'Thiếu nhi' }],
            publishYear: 2018
          },
          { 
            id: '4', 
            title: 'Dế Mèn Phiêu Lưu Ký', 
            author: { id: '4', name: 'Tô Hoài' },
            price: 78000,
            stock: 60,
            categories: [{ id: '3', name: 'Thiếu nhi' }],
            publishYear: 2019
          },
        ];
        setBooks(mockBooks);
        setTotalPages(3); // Giả lập có 3 trang
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sách:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Giả lập dữ liệu thể loại
      const mockCategories = [
        { id: '1', name: 'Tự lực' },
        { id: '2', name: 'Tiểu thuyết' },
        { id: '3', name: 'Thiếu nhi' },
        { id: '4', name: 'Kinh tế' }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thể loại:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks();
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleDeleteClick = (book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    
    try {
      // Gọi API xóa sách (giả lập)
      console.log('Xóa sách:', bookToDelete);
      
      // Cập nhật UI sau khi xóa
      setBooks(books.filter(book => book.id !== bookToDelete.id));
      setShowDeleteModal(false);
      setBookToDelete(null);
    } catch (error) {
      console.error('Lỗi khi xóa sách:', error);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Sách</h2>
          <p className="text-gray-500">Quản lý kho sách của hiệu sách</p>
        </div>
        <Button onClick={() => navigate('/admin/books/add')}>
          <Plus className="mr-2 h-4 w-4" /> Thêm sách mới
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex w-full md:w-1/2 gap-2">
              <Input
                type="search"
                placeholder="Tìm theo tên sách, tác giả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="border rounded-md px-3 py-1 bg-white"
                >
                  <option value="">Tất cả thể loại</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Tên sách</th>
                  <th className="pb-2 text-left font-medium">Tác giả</th>
                  <th className="pb-2 text-left font-medium">Thể loại</th>
                  <th className="pb-2 text-right font-medium">Giá bán</th>
                  <th className="pb-2 text-right font-medium">Tồn kho</th>
                  <th className="pb-2 text-left font-medium">Năm XB</th>
                  <th className="pb-2 text-center font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-4 text-center">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-4 text-center">
                      Không có sách nào được tìm thấy.
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div className="font-medium">{book.title}</div>
                      </td>
                      <td className="py-4">{book.author.name}</td>
                      <td className="py-4">
                        <div className="flex flex-wrap gap-1">
                          {book.categories.map((category) => (
                            <span 
                              key={category.id}
                              className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-right">
                        {formatCurrency(book.price)}
                      </td>
                      <td className="py-4 text-right">
                        {book.stock}
                      </td>
                      <td className="py-4">{book.publishYear}</td>
                      <td className="py-4">
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/admin/books/edit/${book.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteClick(book)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-500">
              Hiển thị {books.length} / {totalPages * books.length} kết quả
            </div>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Xác nhận xóa sách</h3>
            <p>
              Bạn có chắc chắn muốn xóa sách "{bookToDelete?.title}"? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end mt-6 gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </Button>
              <Button 
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
