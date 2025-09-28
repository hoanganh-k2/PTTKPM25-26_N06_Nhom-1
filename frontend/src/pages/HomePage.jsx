import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import bookService from "../services/book.service";
import authorService from "../services/author.service";
import "./HomePage.css"; // Specific HomePage styles

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [featuredBook, setFeaturedBook] = useState(null);
  const [bestsellerBooks, setBestsellerBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data in parallel
      const [
        bestsellerResponse,
        latestResponse,
        authorsResponse
      ] = await Promise.all([
        bookService.getBestsellerBooks(8).catch(() => ({ books: [] })),
        bookService.getLatestBooks(4).catch(() => ({ books: [] })),
        authorService.getAllAuthors({ limit: 1 }).catch(() => ({ authors: [] }))
      ]);

      setBestsellerBooks(bestsellerResponse.books || bestsellerResponse || []);
      setLatestBooks(latestResponse.books || latestResponse || []);
      setAuthors(authorsResponse.authors || authorsResponse || []);

      // Set featured book as the first bestseller or latest book
      const allBooks = [
        ...(bestsellerResponse.books || bestsellerResponse || []),
        ...(latestResponse.books || latestResponse || [])
      ];
      
      if (allBooks.length > 0) {
        setFeaturedBook(allBooks[0]);
      } else {
        // Fallback featured book
        setFeaturedBook({
          id: 'featured-fallback',
          title: 'Khám phá thế giới sách',
          description: 'Chào mừng bạn đến với cửa hàng sách của chúng tôi. Khám phá những cuốn sách hay nhất từ các tác giả nổi tiếng.',
          author: { name: 'Đang cập nhật' },
          coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        });
      }

    } catch (error) {
      console.error('Error fetching homepage data:', error);
      setError('Có lỗi xảy ra khi tải dữ liệu trang chủ');
      
      // Set fallback data
      setFeaturedBook({
        id: 'featured-fallback',
        title: 'Khám phá thế giới sách',
        description: 'Chào mừng bạn đến với cửa hàng sách của chúng tôi.',
        author: { name: 'Đang cập nhật' },
        coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle newsletter subscription
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Vui lòng nhập địa chỉ email');
      return;
    }

    setIsSubscribing(true);
    try {
      // Simulate API call - replace with actual newsletter service
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Đăng ký thành công! Cảm ơn bạn đã quan tâm.');
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      alert('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
    } finally {
      setIsSubscribing(false);
    }
  };

  // Format price function
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(Number(price));
  };

  // Get display image
  const getBookImage = (book) => {
    // Kiểm tra các trường ảnh có thể có
    if (book?.coverImage) return book.coverImage;
    if (book?.cover_image) return book.cover_image;
    if (book?.image) return book.image;
    if (book?.thumbnail) return book.thumbnail;
    
    // Ảnh mặc định cho sách
    return 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  };

  // Danh sách ảnh tác giả mặc định
  const defaultAuthorImages = [
    'https://cdn.britannica.com/20/195620-050-9379EDA9/Murakami-Haruki-2012.jpg',
  ];

  // Get author info với ảnh tự động
  const getAuthorImage = (author, index = 0) => {
    if (author?.image || author?.avatar || author?.photo) {
      return author.image || author.avatar || author.photo;
    }
    return defaultAuthorImages[index % defaultAuthorImages.length];
  };

  const featuredAuthor = authors[0] ? {
    ...authors[0],
    image: getAuthorImage(authors[0], 0)
  } : {
    name: "Đang cập nhật",
    image: defaultAuthorImages[0],
    bio: "Thông tin tác giả đang được cập nhật..."
  };

  return (
    <>
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner">Đang tải...</div>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <Button onClick={fetchHomePageData} className="retry-btn">Thử lại</Button>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <div className="new-release">SẢN PHẨM NỔI BẬT</div>
              <h1>{featuredBook?.title || "Đang tải..."}</h1>
              <p>
                {featuredBook?.description || "Khám phá những cuốn sách hay nhất từ tác giả nổi tiếng với nội dung hấp dẫn và ý nghĩa sâu sắc."}
              </p>
              <div className="hero-buttons">
                {featuredBook?.id && featuredBook.id !== 'featured-fallback' ? (
                  <>
                    <Link to={`/books/${featuredBook.id}`}>
                      <Button className="buy-now-btn">Mua ngay</Button>
                    </Link>
                    <Link to={`/books/${featuredBook.id}`}>
                      <Button variant="outline" className="read-sample-btn">Xem chi tiết</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/books">
                      <Button className="buy-now-btn">Xem sách</Button>
                    </Link>
                    <Link to="/books">
                      <Button variant="outline" className="read-sample-btn">Khám phá</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="hero-image">
              <div className="book-cover" style={{
                backgroundImage: `url(${getBookImage(featuredBook)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}>
                {/* <div className="book-overlay">
                  <div className="author-name">{featuredBook?.author?.name || featuredBook?.authorName || "Đang cập nhật"}</div>
                  <div className="book-title">
                    <div>{featuredBook?.title || "Đang tải..."}</div>
                  </div>
                  <div className="book-description">
                    {featuredBook?.description || "Khám phá những cuốn sách hay nhất"}
                  </div>
                  <div className="book-badge">Sách nổi bật</div>
                </div> */}
              </div>
            </div>
          </section>

          {/* Author Biography */}
          <section className="author-section">
            <div className="author-image">
              <img src={"https://cdn.britannica.com/20/195620-050-9379EDA9/Murakami-Haruki-2012.jpg"}  alt={featuredAuthor.name} />
            </div>
            <div className="author-content">
              <div className="biography-label">TIỂU SỬ TÁC GIẢ</div>
              {/* <h2>{featuredAuthor.name}</h2>
              <p>{featuredAuthor.bio}</p> */}
              <h2>Haruki Murakami</h2>
              <p>Nhà văn Nhật Bản hiện đại</p>
              <p>
                Một trong những tác giả được yêu thích nhất với nhiều tác phẩm 
                nổi tiếng và được độc giả đón nhận một cách nhiệt tình.
              </p>
              <Button variant="outline" className="read-more-btn">Đọc thêm</Button>
            </div>
          </section>

          {/* Best Selling Books */}
          <section className="bestselling-section">
            <h2>Sách bán chạy nhất</h2>
            <p className="section-description">
              Khám phá những cuốn sách được độc giả yêu thích nhất, với nội dung hấp dẫn 
              và chất lượng được đảm bảo từ các tác giả nổi tiếng.
            </p>
            
            <div className="books-grid">
              {bestsellerBooks.length > 0 ? bestsellerBooks.map(book => (
                <div key={book.id} className="book-item">
                  <Link to={`/books/${book.id}`} className="book-link">
                    <div className="book-cover-container">
                      {book.discount > 0 && <div className="sale-badge">Giảm giá!</div>}
                      <img src={getBookImage(book)} alt={book.title} className="book-cover-image" />
                      <div className="book-author">
                        {book.authors && book.authors.length > 0 
                          ? book.authors.map(author => author.name).join(', ')
                          : book.author?.name || book.authorName || "Đang cập nhật"
                        }
                      </div>
                    </div>
                    <div className="book-details">
                      <div className="book-category">{book.category?.name || book.categoryName || "Sách"}</div>
                      <h3 className="book-title">{book.title}</h3>
                      <div className="book-price">
                        {book.discount > 0 ? (
                          <>
                            <span className="original-price">
                              {formatPrice(book.originalPrice || (book.price * 100 / (100 - book.discount)))}
                            </span>
                            <span className="sale-price">{formatPrice(book.price)}</span>
                          </>
                        ) : (
                          <span className="regular-price">{formatPrice(book.price)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              )) : (
                <div className="no-books-message">
                  <p>Hiện tại chưa có sách nào trong danh sách bán chạy.</p>
                </div>
              )}
            </div>

            <div className="see-all-books">
              <Link to="/books">
                <Button variant="outline" className="shop-all-btn">Xem tất cả sách</Button>
              </Link>
            </div>
          </section>

          {/* Newsletter Section */}
          <section className="newsletter-section">
            <h2>Đăng ký nhận thông tin</h2>
            <p>
              Hãy là người đầu tiên nhận được thông tin về những cuốn sách mới nhất 
              và các chương trình khuyến mãi hấp dẫn
            </p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <Input 
                type="email" 
                placeholder="Địa chỉ email của bạn" 
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="subscribe-btn"
                disabled={isSubscribing}
              >
                {isSubscribing ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
            </form>
          </section>
        </>
      )}
    </>
  );
}
