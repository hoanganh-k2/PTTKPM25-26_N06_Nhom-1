import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import bookService from "../services/book.service";
import { useCart } from "../contexts/CartContext";
import "./BooksPage.css";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, isInCart } = useCart();
  const [filters, setFilters] = useState({
    categoryId: "",
    authorId: "",
    publisherId: "",
    sortBy: "title",
    sortOrder: "asc",
    page: 1,
    limit: 12,
    isNew: false,      // Lọc sách mới (tạo trong 30 ngày qua)
    isPopular: false,  // Lọc sách được yêu thích (tồn kho thấp < 10)
  });

  // States for filter options
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);

  // Debounced fetch function
  const fetchBooks = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      // Tạo bản sao của filters để gửi đến API
      const apiFilters = { ...currentFilters };
      
      // Xóa các filter đặc biệt (isNew và isPopular) vì chúng sẽ được xử lý riêng ở frontend
      delete apiFilters.isNew;
      delete apiFilters.isPopular;
      
      const response = await bookService.getAllBooks(apiFilters);
      let filteredBooks = response.books || response.data || [];
      
      // Lọc sách mới (tạo trong vòng 30 ngày)
      if (currentFilters.isNew) {
        filteredBooks = filteredBooks.filter(book => 
          book.createdAt && new Date(book.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );
      }
      
      // Lọc sách được yêu thích (tồn kho thấp < 10)
      if (currentFilters.isPopular) {
        filteredBooks = filteredBooks.filter(book => 
          book.stock > 0 && book.stock < 10
        );
      }
      
      setBooks(filteredBooks);
      setTotalBooks(currentFilters.isNew || currentFilters.isPopular ? filteredBooks.length : response.total || filteredBooks.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err.message || "Không thể tải danh sách sách");
      // Fallback to dummy data if API fails
      setBooks(dummyBooks);
      setTotalBooks(dummyBooks.length);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch filter options (categories, authors, publishers)
  const fetchFilterOptions = useCallback(async () => {
    try {
      // Fetch categories
      const categoriesResponse = await bookService.getAllCategories();
      // Handle different response formats
      const categoriesData = categoriesResponse?.data || categoriesResponse || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      
      // For now, we'll extract authors and publishers from books
      // In a real app, you'd have separate endpoints for these
      const booksResponse = await bookService.getAllBooks({ limit: 1000 }); // Get all books to extract unique authors/publishers
      const booksData = booksResponse.books || booksResponse.data || booksResponse || [];
      
      // Extract unique authors
      const uniqueAuthors = [];
      const authorMap = new Map();
      
      if (Array.isArray(booksData)) {
        booksData.forEach(book => {
          if (book.authors && Array.isArray(book.authors) && book.authors.length > 0) {
            book.authors.forEach(author => {
              if (author && author.name && !authorMap.has(author.id || author.name)) {
                authorMap.set(author.id || author.name, author);
                uniqueAuthors.push(author);
              }
            });
          } else if (book.author && book.author.name) {
            if (!authorMap.has(book.author.id || book.author.name)) {
              authorMap.set(book.author.id || book.author.name, book.author);
              uniqueAuthors.push(book.author);
            }
          }
          // Extract author from specifications if available
          if (book.specifications && book.specifications['Tác giả']) {
            const authorName = book.specifications['Tác giả'];
            if (!authorMap.has(authorName)) {
              const author = { name: authorName, id: authorName };
              authorMap.set(authorName, author);
              uniqueAuthors.push(author);
            }
          }
        });
      }
      setAuthors(uniqueAuthors);
      
      // Extract unique publishers
      const uniquePublishers = [];
      const publisherMap = new Map();
      
      if (Array.isArray(booksData)) {
        booksData.forEach(book => {
          if (book.publisher && book.publisher.name && !publisherMap.has(book.publisher.id || book.publisher.name)) {
            publisherMap.set(book.publisher.id || book.publisher.name, book.publisher);
            uniquePublishers.push(book.publisher);
          } else if (book.brand && !publisherMap.has(book.brand)) {
            const publisher = { id: book.brand, name: book.brand };
            publisherMap.set(book.brand, publisher);
            uniquePublishers.push(publisher);
          }
          // Extract publisher from specifications if available
          if (book.specifications && book.specifications['Nhà xuất bản']) {
            const publisherName = book.specifications['Nhà xuất bản'];
            if (!publisherMap.has(publisherName)) {
              const publisher = { name: publisherName, id: publisherName };
              publisherMap.set(publisherName, publisher);
              uniquePublishers.push(publisher);
            }
          }
        });
      }
      setPublishers(uniquePublishers);
      
    } catch (err) {
      console.error('Error fetching filter options:', err);
      // Set fallback filter options
      setCategories([
        { id: "1", name: "Kỹ năng sống" },
        { id: "2", name: "Tiểu thuyết" },
        { id: "3", name: "Tâm lý học" },
        { id: "4", name: "Kinh tế" }
      ]);
      setAuthors([
        { id: "Dale Carnegie", name: "Dale Carnegie" },
        { id: "Daniel Kahneman", name: "Daniel Kahneman" },
        { id: "Nguyễn Nhật Ánh", name: "Nguyễn Nhật Ánh" }
      ]);
      setPublishers([
        { id: "NXB Trẻ", name: "NXB Trẻ" },
        { id: "NXB Tổng hợp TP.HCM", name: "NXB Tổng hợp TP.HCM" }
      ]);
    }
  }, []);

  useEffect(() => {
    // Fetch filter options first
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBooks(filters);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, fetchBooks]);

  // Tạm thời giả lập danh sách sách, khi có API thật sẽ sử dụng data từ API
  const dummyBooks = [
    {
      id: "1",
      title: "Đắc Nhân Tâm",
      author: { name: "Dale Carnegie" },
      price: 120000,
      coverImage: "https://placehold.co/600x900",
      categories: [{ name: "Tự lực" }],
      stock: 50
    },
    {
      id: "2",
      title: "Nhà Giả Kim",
      author: { name: "Paulo Coelho" },
      price: 90000,
      coverImage: "https://placehold.co/600x900",
      categories: [{ name: "Tiểu thuyết" }],
      stock: 40
    },
    {
      id: "3",
      title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
      author: { name: "Nguyễn Nhật Ánh" },
      price: 85000,
      coverImage: "https://placehold.co/600x900",
      categories: [{ name: "Tiểu thuyết" }, { name: "Thiếu nhi" }],
      stock: 35
    },
    {
      id: "4",
      title: "Dế Mèn Phiêu Lưu Ký",
      author: { name: "Tô Hoài" },
      price: 78000,
      coverImage: "https://placehold.co/600x900",
      categories: [{ name: "Thiếu nhi" }],
      stock: 60
    }
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
      page: 1, // Reset page when filter changes
    });
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [sortBy, sortOrder] = value.split("-");
    setFilters({
      ...filters,
      sortBy,
      sortOrder,
      page: 1, // Reset page when sort changes
    });
  };

  const handlePageChange = (page) => {
    setFilters({
      ...filters,
      page,
    });
    // Scroll to top when changing page
    window.scrollTo(0, 0);
  };

  const displayedBooks = books;

  return (
    <div className="books-page-container">
      <h1 className="books-page-title">Tất cả sách</h1>
      
      <div className="books-page-content">
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h2>Bộ lọc</h2>
            <div className="filter-group">
              <label htmlFor="categoryId">Thể loại</label>
              <select 
                id="categoryId" 
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả thể loại</option>
                {Array.isArray(categories) && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="authorId">Tác giả</label>
              <select 
                id="authorId" 
                name="authorId"
                value={filters.authorId}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả tác giả</option>
                {Array.isArray(authors) && authors.map(author => (
                  <option key={author.id || author.name} value={author.id || author.name}>
                    {author.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="publisherId">Nhà xuất bản</label>
              <select 
                id="publisherId" 
                name="publisherId"
                value={filters.publisherId}
                onChange={handleFilterChange}
              >
                <option value="">Tất cả nhà xuất bản</option>
                {Array.isArray(publishers) && publishers.map(publisher => (
                  <option key={publisher.id || publisher.name} value={publisher.id || publisher.name}>
                    {publisher.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="sortBy">Sắp xếp theo</label>
              <select 
                id="sortBy"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={handleSortChange}
              >
                <option value="title-asc">Tên A-Z</option>
                <option value="title-desc">Tên Z-A</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="publishYear-desc">Mới nhất</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Trạng thái</label>
              <div className="checkbox-group">
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="isNew" 
                    name="isNew"
                    checked={filters.isNew}
                    onChange={(e) => handleFilterChange({
                      target: { name: 'isNew', value: e.target.checked }
                    })}
                  />
                  <label htmlFor="isNew">Sách mới</label>
                </div>
                <div className="checkbox-item">
                  <input 
                    type="checkbox" 
                    id="isPopular" 
                    name="isPopular"
                    checked={filters.isPopular}
                    onChange={(e) => handleFilterChange({
                      target: { name: 'isPopular', value: e.target.checked }
                    })}
                  />
                  <label htmlFor="isPopular">Sách được yêu thích</label>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        <div className="books-grid-container">
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '300px',
              fontSize: '1.1rem',
              color: '#64748b'
            }}>
              Đang tải danh sách sách...
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="books-grid fade-in">
                {displayedBooks.map((book) => (
                  <div key={book.id} className="book-card">
                    <Link to={`/books/${book.id}`} className="book-card-link">
                      <div className="book-card-image-container">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="book-card-image"
                        />
                        {/* Hiển thị nhãn sách mới nếu sách được tạo trong vòng 30 ngày */}
                        {book.createdAt && new Date(book.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                          <div className="book-card-badge new-book">Sách mới</div>
                        )}
                        {/* Hiển thị nhãn sách được yêu thích nếu tồn kho thấp (ít hơn 10 cuốn) */}
                        {book.stock > 0 && book.stock < 10 && (
                          <div className="book-card-badge popular-book">Sách được yêu thích</div>
                        )}
                      </div>
                      <div className="book-card-content">
                        <h3 className="book-card-title">{book.title}</h3>
                        <p className="book-card-author">
                          {book.authors && book.authors.length > 0 
                            ? book.authors.map(author => author.name).join(', ')
                            : book.author?.name || "Không xác định"
                          }
                        </p>
                        <div className="book-card-categories">
                          {book.categories && book.categories.map((category, index) => (
                            <span key={index} className="book-card-category">
                              {category.name}
                            </span>
                          ))}
                        </div>
                        <div className="book-card-price">
                          {book.price?.toLocaleString('vi-VN')} ₫
                        </div>
                        <div className="book-card-stock">
                          {book.stock > 0 ? `Còn ${book.stock} sản phẩm` : "Hết hàng"}
                        </div>
                      </div>
                    </Link>
                    <button 
                      className={`add-to-cart-button ${isInCart(book.id) ? 'added' : ''}`}
                      onClick={() => {
                        addToCart(book, 1);
                        // Hiển thị thông báo
                        alert(`Đã thêm "${book.title}" vào giỏ hàng`);
                      }}
                      disabled={book.stock <= 0}
                    >
                      {isInCart(book.id) ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="pagination">
                <button
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                  className="pagination-button"
                >
                  Trước
                </button>
                <span className="pagination-info">
                  Trang {filters.page} / {Math.ceil(totalBooks / filters.limit) || 1}
                </span>
                <button
                  disabled={filters.page >= Math.ceil(totalBooks / filters.limit) || !totalBooks}
                  onClick={() => handlePageChange(filters.page + 1)}
                  className="pagination-button"
                >
                  Sau
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}