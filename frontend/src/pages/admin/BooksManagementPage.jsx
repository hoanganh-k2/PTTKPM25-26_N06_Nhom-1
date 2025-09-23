import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Filter, BookOpen, RefreshCw, AlertCircle, Save } from 'lucide-react';
import bookService from '../../services/book.service';
import categoryService from '../../services/category.service';
import authorService from '../../services/author.service';
import publisherService from '../../services/publisher.service';
import { FormModal, ConfirmModal } from '../../components/ui/modal';
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
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  
  // Modal states
  const [showBookModal, setShowBookModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    authors: [], // Thay đổi từ authorId thành authors array
    publisherId: '',
    categories: [],
    description: '',
    price: '',
    stock: '',
    publishYear: '',
    pages: '',
    isbn: ''
  });
  const [errors, setErrors] = useState({});

  // Memoized fetch functions - moved up to fix hoisting issue
  const fetchBooks = useCallback(async () => {
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
  }, [currentPage, selectedCategory, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoryService.getAllCategories();
      setCategories(response.categories || response || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách thể loại:', error);
      setCategories([]);
    }
  }, []);

  const fetchAuthors = useCallback(async () => {
    try {
      const response = await authorService.getAllAuthors();
      setAuthors(response.authors || response || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tác giả:', error);
      setAuthors([]);
    }
  }, []);

  const fetchPublishers = useCallback(async () => {
    try {
      const response = await publisherService.getAllPublishers();
      setPublishers(response.publishers || response || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhà xuất bản:', error);
      setPublishers([]);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    // Load reference data only once
    fetchCategories();
    fetchAuthors();
    fetchPublishers();
  }, [fetchCategories, fetchAuthors, fetchPublishers]);

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Memoized handlers and utils
  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      authorId: '',
      publisherId: '',
      categories: [],
      description: '',
      price: '',
      stock: '',
      publishYear: '',
      pages: '',
      isbn: ''
    });
    setErrors({});
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleCategoryChange = useCallback((e) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, categories: selectedValues }));
    if (errors.categories) {
      setErrors(prev => ({ ...prev, categories: '' }));
    }
  }, [errors.categories]);

  const handleFilterCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  }, []);

  // Format currency - memoized
  const formatCurrency = useCallback((value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  }, []);

  // Pagination info - memoized
  const paginationInfo = useMemo(() => ({
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    totalItems: totalPages * 10, // approximation
    displayedItems: books.length
  }), [currentPage, totalPages, books.length]);

  const openAddModal = useCallback(() => {
    resetForm();
    setEditingBook(null);
    setShowBookModal(true);
  }, [resetForm]);

  const openEditModal = useCallback((book) => {
    setFormData({
      title: book.title || '',
      authorId: book.authorId || '',
      publisherId: book.publisherId || '',
      categories: book.categoryIds || [],
      description: book.description || '',
      price: book.price || '',
      stock: book.stock || '',
      publishYear: book.publishYear || '',
      pages: book.pageCount || '',
      isbn: book.ISBN || ''
    });
    setEditingBook(book);
    setErrors({});
    setShowBookModal(true);
  }, []);

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Tên sách là bắt buộc';
    if (!formData.authorId) newErrors.authorId = 'Tác giả là bắt buộc';
    if (!formData.publisherId) newErrors.publisherId = 'Nhà xuất bản là bắt buộc';
    if (formData.categories.length === 0) newErrors.categories = 'Ít nhất một thể loại là bắt buộc';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Giá bán phải lớn hơn 0';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Số lượng không được âm';
    if (!formData.publishYear || formData.publishYear < 1000 || formData.publishYear > new Date().getFullYear()) {
      newErrors.publishYear = 'Năm xuất bản không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const apiData = {
        title: formData.title.trim(),
        authorId: formData.authorId,
        publisherId: formData.publisherId,
        categoryIds: formData.categories,
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        publishYear: parseInt(formData.publishYear),
        pageCount: formData.pages ? parseInt(formData.pages) : undefined,
        ISBN: formData.isbn.trim() || undefined
      };
      if (editingBook) {
        await bookService.updateBook(editingBook.id, apiData);
      } else {
        await bookService.createBook(apiData);
      }
      
      setShowBookModal(false);
      fetchBooks();
      setSubmitting(false);
    } catch (error) {
      console.error('Lỗi khi lưu sách:', error);
      alert(`Có lỗi xảy ra: ${error.message || 'Vui lòng thử lại'}`);
      setSubmitting(false);
    }
  }, [validateForm, formData, editingBook, fetchBooks]);

  // Search handler  
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBooks();
  }, [fetchBooks]);

  // Delete handlers
  const handleDeleteClick = useCallback((book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
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
      const errorMsg = error.message || error.error || (typeof error === 'string' ? error : 'Lỗi không xác định');
      if (errorMsg.includes('đơn hàng') || errorMsg.includes('stock = 0') || errorMsg.includes('foreign key')) {
        // Hiển thị dialog hỏi có muốn ẩn sách không
        const userConfirm = window.confirm(
          `${errorMsg}\n\nBạn có muốn ẩn sách này thay vì xóa không? (sẽ set stock = 0)`
        );
        
        if (userConfirm) {
          try {
            await bookService.hideBook(bookToDelete.id);
            alert('Đã ẩn sách thành công!');
            
            // Refresh lại danh sách
            fetchBooks();
            setShowDeleteModal(false);
            setBookToDelete(null);
          } catch (hideError) {
            console.error('Lỗi khi ẩn sách:', hideError);
            alert('Có lỗi xảy ra khi ẩn sách. Vui lòng thử lại.');
          }
        }
      } else {
        alert(errorMsg);
      }
    }
  }, [bookToDelete, books, fetchBooks]);

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
        <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
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
                onChange={handleFilterCategoryChange}
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
                      <td>
                        {book.authors && book.authors.length > 0 
                          ? book.authors.map(author => author.name).join(', ')
                          : book.author?.name || 'Chưa có tác giả'
                        }
                      </td>
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
                            onClick={() => openEditModal(book)}
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

      {/* Book Form Modal */}
      <FormModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
        title={editingBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
        size="large"
        submitText={editingBook ? 'Cập nhật' : 'Thêm'}
      >
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Tên sách <span className="text-danger">*</span>
          </label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            placeholder="Nhập tên sách"
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="authorId" className="form-label">
                Tác giả <span className="text-danger">*</span>
              </label>
              <select
                id="authorId"
                name="authorId"
                value={formData.authorId}
                onChange={handleChange}
                className={`form-select ${errors.authorId ? 'is-invalid' : ''}`}
              >
                <option value="">-- Chọn tác giả --</option>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
              {errors.authorId && <div className="invalid-feedback">{errors.authorId}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="publisherId" className="form-label">
                Nhà xuất bản <span className="text-danger">*</span>
              </label>
              <select
                id="publisherId"
                name="publisherId"
                value={formData.publisherId}
                onChange={handleChange}
                className={`form-select ${errors.publisherId ? 'is-invalid' : ''}`}
              >
                <option value="">-- Chọn nhà xuất bản --</option>
                {publishers.map((publisher) => (
                  <option key={publisher.id} value={publisher.id}>
                    {publisher.name}
                  </option>
                ))}
              </select>
              {errors.publisherId && <div className="invalid-feedback">{errors.publisherId}</div>}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="categories" className="form-label">
            Thể loại <span className="text-danger">*</span>
          </label>
          <select
            id="categories"
            name="categories"
            multiple
            value={formData.categories}
            onChange={handleCategoryChange}
            className={`form-select ${errors.categories ? 'is-invalid' : ''}`}
            style={{ height: '120px' }}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <small className="form-text text-muted">Giữ Ctrl để chọn nhiều thể loại</small>
          {errors.categories && <div className="invalid-feedback">{errors.categories}</div>}
        </div>

        <div className="row">
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Giá bán (VNĐ) <span className="text-danger">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                placeholder="0"
              />
              {errors.price && <div className="invalid-feedback">{errors.price}</div>}
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="stock" className="form-label">
                Số lượng <span className="text-danger">*</span>
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                className={`form-control ${errors.stock ? 'is-invalid' : ''}`}
                placeholder="0"
              />
              {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label htmlFor="publishYear" className="form-label">
                Năm xuất bản <span className="text-danger">*</span>
              </label>
              <input
                id="publishYear"
                name="publishYear"
                type="number"
                value={formData.publishYear}
                onChange={handleChange}
                className={`form-control ${errors.publishYear ? 'is-invalid' : ''}`}
                placeholder={new Date().getFullYear()}
              />
              {errors.publishYear && <div className="invalid-feedback">{errors.publishYear}</div>}
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="pages" className="form-label">
                Số trang
              </label>
              <input
                id="pages"
                name="pages"
                type="number"
                value={formData.pages}
                onChange={handleChange}
                className="form-control"
                placeholder="0"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="isbn" className="form-label">
                ISBN
              </label>
              <input
                id="isbn"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                className="form-control"
                placeholder="Nhập mã ISBN"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Mô tả
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            placeholder="Nhập mô tả sách"
          ></textarea>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa sách"
        message={`Bạn có chắc chắn muốn xóa sách "${bookToDelete?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
      />
    </div>
  );
}