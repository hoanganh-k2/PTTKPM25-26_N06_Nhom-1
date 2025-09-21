import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Filter, BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import bookService from '../../services/book.service';
import categoryService from '../../services/category.service';
import './AdminPages.css';

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

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1);
        fetchBooks();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10, // 10 sách mỗi trang
        search: searchQuery,
        categoryId: selectedCategory
      };
      
      const response = await bookService.getAllBooks(params);
      setBooks(response.books || []);
      
      // Tính tổng số trang từ total và limit
      const totalPages = Math.ceil((response.total || 0) / 10);
      setTotalPages(totalPages);
      
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sách:', error);
      setBooks([]);
      setTotalPages(1);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.categories || response || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thể loại:', error);
      setCategories([]);
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
      await bookService.deleteBook(bookToDelete.id);
      
      // Cập nhật UI sau khi xóa
      setBooks(books.filter(book => book.id !== bookToDelete.id));
      setShowDeleteModal(false);
      setBookToDelete(null);
      
      // Refresh lại danh sách để cập nhật pagination
      fetchBooks();
    } catch (error) {
      console.error('Lỗi khi xóa sách:', error);
      alert('Có lỗi xảy ra khi xóa sách. Vui lòng thử lại.');
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
    <div className="admin-container fade-in">
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-title-icon"><BookOpen size={20} /></span>
          <div>
            <h2>Quản lý Sách</h2>
            {/* <p className="text-sm text-text-secondary">Quản lý kho sách của hiệu sách</p> */}
          </div>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => navigate('/admin/books/add')}>
          <Plus className="h-4 w-4 mr-1" /> Thêm sách mới
        </button>
      </div>

      <div className="admin-card slide-up">
        <div className="admin-card-content">
          <div className="admin-controls">
            <div className="admin-search">
              <Search className="admin-search-icon" />
              <input 
                type="search" 
                placeholder="Tìm theo tên sách, tác giả..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-form-input"
              />
            </div>
            
            <div className="admin-filters">
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="admin-form-select"
              >
                <option value="">Tất cả thể loại</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button className="admin-filter-btn" onClick={handleSearch}>
                <Filter className="h-4 w-4 mr-1" /> Lọc
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên sách</th>
                  <th>Tác giả</th>
                  <th>Thể loại</th>
                  <th style={{textAlign: 'right'}}>Giá bán</th>
                  <th style={{textAlign: 'right'}}>Tồn kho</th>
                  <th>Năm XB</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7">
                      <div className="admin-loading">
                        <div className="admin-loading-spinner">
                          <RefreshCw className="h-8 w-8" />
                        </div>
                        <span>Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan="7">
                      <div className="admin-empty-state">
                        <BookOpen size={24} />
                        <span>Không có sách nào được tìm thấy</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.id}>
                      <td>
                        <div className="font-medium">{book.title}</div>
                      </td>
                      <td>{book.author?.name || 'Chưa có tác giả'}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {(book.categories || []).map((category) => (
                            <span 
                              key={category.id}
                              className="admin-badge admin-badge-blue"
                            >
                              {category.name}
                            </span>
                          ))}
                          {(!book.categories || book.categories.length === 0) && (
                            <span className="text-gray-500">Chưa phân loại</span>
                          )}
                        </div>
                      </td>
                      <td style={{textAlign: 'right'}}>
                        {formatCurrency(book.price)}
                      </td>
                      <td style={{textAlign: 'right'}}>
                        <span className={book.stock < 5 ? 'status-indicator status-error' : 
                                        book.stock < 20 ? 'status-indicator status-warning' : 
                                        'status-indicator status-success'}>
                          {book.stock}
                        </span>
                      </td>
                      <td>{book.publishYear || 'N/A'}</td>
                      <td>
                        <div className="admin-table-actions">
                          <button 
                            className="admin-btn-icon" 
                            onClick={() => navigate(`/admin/books/edit/${book.id}`)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="admin-btn-icon admin-btn-danger"
                            onClick={() => handleDeleteClick(book)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="admin-pagination">
            <div className="admin-pagination-info">
              Hiển thị {books.length} / {totalPages * books.length} kết quả
            </div>
            <div className="admin-pagination-controls">
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`admin-btn ${currentPage === index + 1 ? 'admin-btn-active' : 'admin-btn-outline'}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Xác nhận xóa sách</h3>
            </div>
            <div className="admin-modal-content">
              <div className="admin-alert admin-alert-danger">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p>
                    Bạn có chắc chắn muốn xóa sách "<span className="font-medium">{bookToDelete?.title}</span>"?
                  </p>
                  <p className="mt-2">
                    Hành động này không thể hoàn tác.
                  </p>
                </div>
              </div>
              <div className="admin-form-actions mt-6">
                <button
                  className="admin-btn admin-btn-outline"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="admin-btn admin-btn-danger"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}