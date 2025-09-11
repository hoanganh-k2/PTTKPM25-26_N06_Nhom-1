import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import bookService from '../../services/book.service';

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
      // Trong môi trường thực tế sẽ gọi API
      setTimeout(() => {
        // Giả lập dữ liệu
        const mockBook = {
          id: '1',
          title: 'Đắc Nhân Tâm',
          authorId: '1',
          publisherId: '1',
          categories: ['1'],
          description: 'Đắc nhân tâm (tên tiếng Anh: How to Win Friends and Influence People) là một quyển sách nhằm tự giúp bản thân bán chạy nhất từ trước đến nay. Quyển sách này do Dale Carnegie viết và đã được xuất bản lần đầu vào năm 1936.',
          price: 120000,
          stock: 50,
          publishYear: 2016,
          pages: 320,
          isbn: '9786047563067'
        };
        
        setFormData(mockBook);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin sách:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Giả lập dữ liệu
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

  const fetchAuthors = async () => {
    try {
      // Giả lập dữ liệu
      const mockAuthors = [
        { id: '1', name: 'Dale Carnegie' },
        { id: '2', name: 'Paulo Coelho' },
        { id: '3', name: 'Nguyễn Nhật Ánh' },
        { id: '4', name: 'Tô Hoài' }
      ];
      setAuthors(mockAuthors);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tác giả:', error);
    }
  };

  const fetchPublishers = async () => {
    try {
      // Giả lập dữ liệu
      const mockPublishers = [
        { id: '1', name: 'NXB Tổng hợp TP.HCM' },
        { id: '2', name: 'NXB Trẻ' },
        { id: '3', name: 'NXB Kim Đồng' },
        { id: '4', name: 'NXB Giáo dục' }
      ];
      setPublishers(mockPublishers);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách nhà xuất bản:', error);
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
      if (isEditing) {
        // Gọi API cập nhật sách (giả lập)
        console.log('Cập nhật sách:', formData);
      } else {
        // Gọi API thêm sách mới (giả lập)
        console.log('Thêm sách mới:', formData);
      }
      
      // Chuyển về trang quản lý sách sau khi thành công
      setTimeout(() => {
        navigate('/admin/books');
      }, 500);
    } catch (error) {
      console.error('Lỗi khi lưu sách:', error);
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {isEditing ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
          </h2>
          <p className="text-gray-500">
            {isEditing ? 'Cập nhật thông tin sách' : 'Thêm sách mới vào kho sách'}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/books')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">Đang tải...</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block font-medium">
                    Tên sách <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="authorId" className="block font-medium">
                    Tác giả <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="authorId"
                    name="authorId"
                    value={formData.authorId}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.authorId ? 'border-red-500' : 'border-gray-300'
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
                    <p className="text-red-500 text-sm">{errors.authorId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="publisherId" className="block font-medium">
                    Nhà xuất bản <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="publisherId"
                    name="publisherId"
                    value={formData.publisherId}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 ${
                      errors.publisherId ? 'border-red-500' : 'border-gray-300'
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
                    <p className="text-red-500 text-sm">{errors.publisherId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="categories" className="block font-medium">
                    Thể loại <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categories"
                    name="categories"
                    multiple
                    value={formData.categories}
                    onChange={handleCategoryChange}
                    className={`w-full border rounded-md px-3 py-2 min-h-[100px] ${
                      errors.categories ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-gray-500 text-sm">Giữ Ctrl để chọn nhiều thể loại</p>
                  {errors.categories && (
                    <p className="text-red-500 text-sm">{errors.categories}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="block font-medium">
                    Giá bán (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm">{errors.price}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="stock" className="block font-medium">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    className={errors.stock ? 'border-red-500' : ''}
                  />
                  {errors.stock && (
                    <p className="text-red-500 text-sm">{errors.stock}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="publishYear" className="block font-medium">
                    Năm xuất bản <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="publishYear"
                    name="publishYear"
                    type="number"
                    value={formData.publishYear}
                    onChange={handleChange}
                    className={errors.publishYear ? 'border-red-500' : ''}
                  />
                  {errors.publishYear && (
                    <p className="text-red-500 text-sm">{errors.publishYear}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="pages" className="block font-medium">
                    Số trang
                  </label>
                  <Input
                    id="pages"
                    name="pages"
                    type="number"
                    value={formData.pages}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="isbn" className="block font-medium">
                    ISBN
                  </label>
                  <Input
                    id="isbn"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block font-medium">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border rounded-md px-3 py-2 border-gray-300"
                ></textarea>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
