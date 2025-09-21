import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, BookOpen, RefreshCw, FileText, Package, Bookmark } from 'lucide-react';
import bookService from '../../services/book.service';
import categoryService from '../../services/category.service';
import authorService from '../../services/author.service';
import publisherService from '../../services/publisher.service';
import './AdminPages.css';

export default function BookFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  
  const [formData, setFormData] = useState({
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
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
    fetchPublishers();
    
    if (isEditing) {
      fetchBookDetails();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    setLoading(true);
    try {
      const response = await bookService.getBookById(id);
      
      // Chuyển đổi dữ liệu để phù hợp với form
      const bookData = {
        title: response.title || '',
        authorId: response.authorId || '',
        publisherId: response.publisherId || '',
        categories: response.categoryIds || [],
        description: response.description || '',
        price: response.price || '',
        stock: response.stock || '',
        publishYear: response.publishYear || '',
        pages: response.pageCount || '',
        isbn: response.ISBN || ''
      };
      
      setFormData(bookData);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sách:', error);
      setLoading(false);
      alert('Có lỗi xảy ra khi lấy thông tin sách');
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

  const fetchAuthors = async () => {
    try {
      const response = await authorService.getAllAuthors();
      setAuthors(response.authors || response || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tác giả:', error);
      setAuthors([]);
    }
  };

  const fetchPublishers = async () => {
    try {
      const response = await publisherService.getAllPublishers();
      setPublishers(response.publishers || response || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhà xuất bản:', error);
      setPublishers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Convert string values to appropriate types
    let processedValue = value;
    if (name === 'price' || name === 'stock' || name === 'pages') {
      processedValue = value === '' ? '' : Number(value);
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleCategoryChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setFormData({
      ...formData,
      categories: selectedOptions
    });
    
    // Clear error
    if (errors.categories) {
      setErrors({
        ...errors,
        categories: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title) newErrors.title = 'Vui lòng nhập tên sách';
    if (!formData.authorId) newErrors.authorId = 'Vui lòng chọn tác giả';
    if (!formData.publisherId) newErrors.publisherId = 'Vui lòng chọn nhà xuất bản';
    if (formData.categories.length === 0) newErrors.categories = 'Vui lòng chọn ít nhất một thể loại';
    
    if (!formData.price) {
      newErrors.price = 'Vui lòng nhập giá bán';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Giá bán phải là số dương';
    }
    
    if (!formData.stock) {
      newErrors.stock = 'Vui lòng nhập số lượng';
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'Số lượng phải là số không âm';
    }
    
    if (!formData.publishYear) {
      newErrors.publishYear = 'Vui lòng nhập năm xuất bản';
    } else {
      const year = Number(formData.publishYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear) {
        newErrors.publishYear = `Năm xuất bản phải từ 1900 đến ${currentYear}`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    try {
      // Chuẩn bị dữ liệu để gửi lên API
      const apiData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        authorId: formData.authorId,
        publisherId: formData.publisherId,
        categoryIds: formData.categories,
        publishYear: Number(formData.publishYear),
        pageCount: Number(formData.pages) || undefined,
        ISBN: formData.isbn || undefined
      };

      if (isEditing) {
        await bookService.updateBook(id, apiData);
        alert('Cập nhật sách thành công!');
      } else {
        await bookService.createBook(apiData);
        alert('Thêm sách mới thành công!');
      }
      
      // Chuyển về trang quản lý sách sau khi thành công
      navigate('/admin/books');
    } catch (error) {
      console.error('Lỗi khi lưu sách:', error);
      alert(`Có lỗi xảy ra: ${error.message || 'Vui lòng thử lại'}`);
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-container fade-in">
      <div className="admin-header">
        <div className="admin-title">
          <span className="admin-title-icon"><BookOpen size={20} /></span>
          <div>
            <h2>{isEditing ? 'Chỉnh sửa sách' : 'Thêm sách mới'}</h2>
          </div>
        </div>
        <button className="admin-filter-btn" onClick={() => navigate('/admin/books')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại
        </button>
      </div>

      <div className="admin-card slide-up">
        <div className="admin-card-content">
          {loading ? (
            <div className="admin-loading">
              <div className="admin-loading-spinner">
                <RefreshCw className="h-8 w-8" />
              </div>
              <span>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="admin-form-group">
                  <label htmlFor="title" className="admin-form-label">
                    Tên sách <span className="text-error">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`admin-form-input ${errors.title ? 'border-error' : ''}`}
                  />
                  {errors.title && (
                    <p className="text-error text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="authorId" className="admin-form-label">
                    Tác giả <span className="text-error">*</span>
                  </label>
                  <select
                    id="authorId"
                    name="authorId"
                    value={formData.authorId}
                    onChange={handleChange}
                    className={`admin-form-select ${
                      errors.authorId ? 'border-error' : ''
                    }`}
                  >
                    <option value="">-- Chọn tác giả --</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                  {errors.authorId && (
                    <p className="text-error text-sm mt-1">{errors.authorId}</p>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="publisherId" className="admin-form-label">
                    Nhà xuất bản <span className="text-error">*</span>
                  </label>
                  <select
                    id="publisherId"
                    name="publisherId"
                    value={formData.publisherId}
                    onChange={handleChange}
                    className={`admin-form-select ${
                      errors.publisherId ? 'border-error' : ''
                    }`}
                  >
                    <option value="">-- Chọn nhà xuất bản --</option>
                    {publishers.map((publisher) => (
                      <option key={publisher.id} value={publisher.id}>
                        {publisher.name}
                      </option>
                    ))}
                  </select>
                  {errors.publisherId && (
                    <p className="text-error text-sm mt-1">{errors.publisherId}</p>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="categories" className="admin-form-label">
                    Thể loại <span className="text-error">*</span>
                  </label>
                  <select
                    id="categories"
                    name="categories"
                    multiple
                    value={formData.categories}
                    onChange={handleCategoryChange}
                    className={`admin-form-select min-h-[100px] ${
                      errors.categories ? 'border-error' : ''
                    }`}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-text-tertiary text-sm mt-1">Giữ Ctrl để chọn nhiều thể loại</p>
                  {errors.categories && (
                    <p className="text-error text-sm mt-1">{errors.categories}</p>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="price" className="admin-form-label">
                    Giá bán (VNĐ) <span className="text-error">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    className={`admin-form-input ${errors.price ? 'border-error' : ''}`}
                  />
                  {errors.price && (
                    <p className="text-error text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="stock" className="admin-form-label">
                    Số lượng <span className="text-error">*</span>
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    className={`admin-form-input ${errors.stock ? 'border-error' : ''}`}
                  />
                  {errors.stock && (
                    <p className="text-error text-sm mt-1">{errors.stock}</p>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="publishYear" className="admin-form-label">
                    Năm xuất bản <span className="text-error">*</span>
                  </label>
                  <input
                    id="publishYear"
                    name="publishYear"
                    type="number"
                    value={formData.publishYear}
                    onChange={handleChange}
                    className={`admin-form-input ${errors.publishYear ? 'border-error' : ''}`}
                  />
                  {errors.publishYear && (
                    <p className="text-error text-sm mt-1">{errors.publishYear}</p>
                  )}
                </div>

                <div className="admin-form-group">
                  <label htmlFor="pages" className="admin-form-label">
                    Số trang
                  </label>
                  <input
                    id="pages"
                    name="pages"
                    type="number"
                    value={formData.pages}
                    onChange={handleChange}
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="isbn" className="admin-form-label">
                    ISBN
                  </label>
                  <input
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    className="admin-form-input"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="description" className="admin-form-label">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className="admin-form-textarea"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-add-btn"
                  style={{opacity: submitting ? 0.7 : 1}}
                >
                  <Save className="h-4 w-4" />
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
