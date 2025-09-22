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
      const response = await bookService.getAllBooks(currentFilters);
      setBooks(response.books);
      setTotalBooks(response.total);
      setError(null);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách sách");
    } finally {
      setLoading(false);
    }
  }, []);

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

  const displayedBooks = loading ? [] : (books.length > 0 ? books : dummyBooks);

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
                <option value="1">Tự lực</option>
                <option value="2">Tiểu thuyết</option>
                <option value="3">Thiếu nhi</option>
                <option value="4">Kinh tế</option>
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
                <option value="1">Dale Carnegie</option>
                <option value="2">Paulo Coelho</option>
                <option value="3">Nguyễn Nhật Ánh</option>
                <option value="4">Tô Hoài</option>
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
          </div>
        </aside>
        
        <div className="books-grid-container">
          {loading ? (
            <div className="loading-spinner">Đang tải danh sách sách...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              <div className="books-grid">
                {displayedBooks.map((book) => (
                  <div key={book.id} className="book-card">
                    <Link to={`/books/${book.id}`} className="book-card-link">
                      <div className="book-card-image-container">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="book-card-image"
                        />
                      </div>
                      <div className="book-card-content">
                        <h3 className="book-card-title">{book.title}</h3>
                        <p className="book-card-author">{book.author?.name || "Không xác định"}</p>
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