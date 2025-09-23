import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import bookService from "../services/book.service";
import { useCart } from "../contexts/CartContext";
import "./BookDetailPage.css";

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, isInCart, getItemQuantity } = useCart();

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const bookData = await bookService.getBookById(id);
        setBook(bookData);
        
        // Kiểm tra xem sách đã có trong giỏ hàng chưa
        if (isInCart(id)) {
          // Nếu đã có trong giỏ hàng, lấy số lượng hiện tại
          setQuantity(getItemQuantity(id));
          setAddedToCart(true);
        }
      } catch (err) {
        setError(err.message || "Không thể tải thông tin sách");
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, isInCart, getItemQuantity]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (book?.stock || 1)) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (book) {
      addToCart(book, quantity);
      setAddedToCart(true);
      // Hiển thị thông báo thành công
      const message = isInCart(book.id) 
        ? `Đã cập nhật số lượng "${book.title}" trong giỏ hàng` 
        : `Đã thêm ${quantity} cuốn "${book.title}" vào giỏ hàng`;
      alert(message);
    }
  };

  if (loading) {
    return (
      <div className="book-detail-container">
        <div className="loading-spinner">Đang tải thông tin sách...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-detail-container">
        <div className="error-message">
          <h2>Có lỗi xảy ra!</h2>
          <p>{error}</p>
          <Link to="/books" className="back-link">
            Quay lại danh sách sách
          </Link>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-container">
        <div className="not-found">
          <h2>Không tìm thấy sách</h2>
          <Link to="/books" className="back-link">
            Quay lại danh sách sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="book-detail-container">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> / <Link to="/books">Sách</Link> /{" "}
        <span>{book.title}</span>
      </div>

      <div className="book-detail-content">
        <div className="book-image-container">
          <img
            src={book.coverImage || "https://placehold.co/600x900"}
            alt={book.title}
            className="book-cover-image"
          />
        </div>

        <div className="book-info">
          <h1 className="book-title">{book.title}</h1>
          <div className="book-meta">
            <div className="meta-item">
              <span className="meta-label">Tác giả:</span>
              <span className="meta-value">
                {book.authors && book.authors.length > 0 
                  ? book.authors.map(author => author.name).join(', ')
                  : book.author?.name || "Không xác định"
                }
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Nhà xuất bản:</span>
              <span className="meta-value">{book.publisher?.name || "Không xác định"}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Năm xuất bản:</span>
              <span className="meta-value">{book.publishYear || "Không xác định"}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Số trang:</span>
              <span className="meta-value">{book.pageCount || "Không xác định"}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Ngôn ngữ:</span>
              <span className="meta-value">{book.language || "Không xác định"}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">ISBN:</span>
              <span className="meta-value">{book.ISBN || "Không xác định"}</span>
            </div>
          </div>

          <div className="categories">
            <span className="meta-label">Thể loại:</span>
            <div className="category-tags">
              {book.categories && book.categories.length > 0 ? (
                book.categories.map((category) => (
                  <span key={category.id} className="category-tag">
                    {category.name}
                  </span>
                ))
              ) : (
                <span className="category-tag">Chưa phân loại</span>
              )}
            </div>
          </div>

          <div className="book-price">
            <span className="price-value">{book.price?.toLocaleString('vi-VN')} ₫</span>
            <span className="stock-status">
              {book.stock > 0 ? `Còn ${book.stock} sản phẩm` : "Hết hàng"}
            </span>
          </div>

          {book.stock > 0 && (
            <div className="add-to-cart">
              <div className="quantity-control">
                <button
                  className="quantity-btn"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={book.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="quantity-input"
                />
                <button
                  className="quantity-btn"
                  onClick={() => quantity < book.stock && setQuantity(quantity + 1)}
                  disabled={quantity >= book.stock}
                >
                  +
                </button>
              </div>
              <button 
                className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`} 
                onClick={handleAddToCart}
              >
                {addedToCart ? 'Cập nhật giỏ hàng' : 'Thêm vào giỏ hàng'}
              </button>
              {addedToCart && (
                <Link to="/cart" className="view-cart-link">
                  Xem giỏ hàng
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="book-details-tabs">
        <div className="tab-content">
          <h2>Mô tả sách</h2>
          <div className="book-description">{book.description}</div>
        </div>
      </div>

      <div className="author-info-section">
        <h2>Về tác giả</h2>
        {book.authors && book.authors.length > 0 ? (
          <div className="authors-info">
            {book.authors.map((author, index) => (
              <div key={author.id || index} className="author-info">
                <h3>{author.name}</h3>
                <p className="author-nationality">Quốc tịch: {author.nationality || "Không xác định"}</p>
                <p className="author-biography">{author.biography || "Chưa có thông tin."}</p>
              </div>
            ))}
          </div>
        ) : book.author ? (
          <div className="author-info">
            <h3>{book.author.name}</h3>
            <p className="author-nationality">Quốc tịch: {book.author.nationality || "Không xác định"}</p>
            <p className="author-biography">{book.author.biography || "Chưa có thông tin."}</p>
          </div>
        ) : (
          <p>Không có thông tin về tác giả.</p>
        )}
      </div>

      <div className="publisher-info-section">
        <h2>Về nhà xuất bản</h2>
        {book.publisher ? (
          <div className="publisher-info">
            <h3>{book.publisher.name}</h3>
            <p>{book.publisher.description || "Chưa có thông tin."}</p>
            {book.publisher.website && (
              <a 
                href={book.publisher.website}
                target="_blank" 
                rel="noopener noreferrer" 
                className="publisher-website"
              >
                Trang web nhà xuất bản
              </a>
            )}
          </div>
        ) : (
          <p>Không có thông tin về nhà xuất bản.</p>
        )}
      </div>
    </div>
  );
}