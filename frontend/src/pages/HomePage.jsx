import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import "./HomePage-new.css"; // Specific HomePage styles

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Featured book - hero section
  const featuredBook = {
    id: 1,
    title: "The Sons of the Empire",
    author: "John Roberts",
    description: "Discover the story of vitae magna ornare commodo lectus id rustic morbi leo platea commodo diam in ac urna nisi.",
    coverImage: "https://images.unsplash.com/photo-1563941406054-953918ee8f1f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
    badge: "#1 The World's Best-selling Writer"
  };

  // Author info
  const author = {
    name: "John Roberts",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
    bio: "Tellus tellus mattis pulvinar nulla euismod fermentum rhoncus sed vestibulum neque praesent pharetra ut fames viverra suscipit gravida dictumst volutpat ullamcorper lacus, malesuada enim proin volutpat mattis nunc amet, eget vitae egestas."
  };

  // Books data
  const booksList = [
    {
      id: 2,
      title: "Nhà Giả Kim",
      author: "Paulo Coelho",
      price: 90000,
      image: "https://salt.tikicdn.com/cache/750x750/media/catalog/product/n/h/nha-gia-kim.jpg.webp",
      discount: 10,
    },
    {
      id: 3,
      title: "Cây Cam Ngọt Của Tôi",
      author: "José Mauro de Vasconcelos",
      price: 115000,
      image: "https://salt.tikicdn.com/cache/750x750/ts/product/5e/18/24/2a6154ba08df6ce6161c13f4303fa19e.jpg.webp",
      discount: 20,
    },
    {
      id: 1,
      title: "The Born of APLEX",
      author: "John Roberts",
      price: 26.00,
      originalPrice: 26.00,
      image: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
      discount: 0,
      category: "Fantasy",
      onSale: false,
    },
    {
      id: 2,
      title: "The Throned Mirror",
      author: "John Roberts",
      price: 23.00,
      originalPrice: 23.00,
      image: "https://images.unsplash.com/photo-1566055990545-23e23857e816?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
      discount: 0,
      category: "Fantasy",
      onSale: false,
    },
    {
      id: 3,
      title: "Ark Forging",
      author: "John Roberts",
      price: 20.00,
      originalPrice: 25.00,
      image: "https://images.unsplash.com/photo-1612969308146-066015efc0eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
      discount: 20,
      category: "Fantasy",
      onSale: true,
    },
    {
      id: 4,
      title: "The Sons of the Empire",
      author: "John Roberts",
      price: 20.00,
      originalPrice: 26.00,
      image: "https://images.unsplash.com/photo-1563941406054-953918ee8f1f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
      discount: 23,
      category: "Fantasy",
      onSale: true,
    },
    {
      id: 5,
      title: "Không Gia Đình",
      author: "Hector Malot",
      price: 150000,
      image: "https://salt.tikicdn.com/cache/750x750/ts/product/d5/53/0e/fc00851a00a3a0bf4220e6902cf75ba7.jpg.webp",
      discount: 25,
    },
    {
      id: 6,
      title: "Dế Mèn Phiêu Lưu Ký",
      author: "Tô Hoài",
      price: 78000,
      image: "https://salt.tikicdn.com/cache/750x750/ts/product/8e/ea/73/edf7094d673d5843aec61913a013a6db.jpg.webp",
      discount: 8,
    },
    {
      id: 7,
      title: "Chí Phèo",
      author: "Nam Cao",
      price: 65000,
      image: "https://salt.tikicdn.com/cache/750x750/ts/product/90/49/97/ec414fb26d888d2e2d6b3308bb94e2f9.jpg.webp",
      discount: 5,
    },
    {
      id: 8,
      title: "The Sons of the Empire",
      author: "John Roberts",
      price: 20.00,
      originalPrice: 26.00,
      image: "https://images.unsplash.com/photo-1563941406054-953918ee8f1f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80",
      discount: 23,
      category: "Fantasy",
      onSale: true,
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="new-release">NEW RELEASE</div>
          <h1>The Sons of the Empire</h1>
          <p>
            Justo habitant at augue ac sed proin consectetur ac urna nisl elit
            nulla facilisis viverra dolor sagittis nisi risus egestas adipiscing
            nibh euismod.
          </p>
          <div className="hero-buttons">
            <Button className="buy-now-btn">Buy Now</Button>
            <Button variant="outline" className="read-sample-btn">Read Sample</Button>
          </div>
        </div>
        <div className="hero-image">
          <div className="book-cover">
            <div className="author-name">JOHN ROBERTS</div>
            <div className="book-title">
              <div>The Sons</div>
              <div className="book-title-of">of</div>
              <div>The Empire</div>
            </div>
            <div className="book-description">
              Discover the story of vitae magna ornare commodo lectus id rustic morbi
              leo platea commodo diam in ac urna nisi
            </div>
            <div className="book-badge">#1 The World's Best-selling Writer</div>
          </div>
        </div>
      </section>

      {/* Author Biography */}
      <section className="author-section">
        <div className="author-image">
          <img src={author.image} alt={author.name} />
        </div>
        <div className="author-content">
          <div className="biography-label">BIOGRAPHY</div>
          <h2>John Roberts</h2>
          <p>{author.bio}</p>
          <p>
            Vulputate vulputate eget cursus nam ultricies mauris, malesuada
            elementum lacus arcu, sit dolor ipsum, ac felis, egestas vel tortor
            eget aenean nam.
          </p>
          <Button variant="outline" className="read-more-btn">Read More</Button>
        </div>
      </section>

      {/* Best Selling Books */}
      <section className="bestselling-section">
        <h2>Best Selling Books</h2>
        <p className="section-description">
          Vulputate vulputate eget cursus nam ultricies mauris, malesuada elementum lacus 
          arcu, sit dolor ipsum, ac felis, egestas vel tortor eget aenean.
        </p>
        
        <div className="books-grid">
          {booksList.map(book => (
            <div key={book.id} className="book-item">
              <Link to={`/books/${book.id}`} className="book-link">
                <div className="book-cover-container">
                  {book.onSale && <div className="sale-badge">Sale!</div>}
                  <img src={book.image} alt={book.title} className="book-cover-image" />
                  <div className="book-author">{book.author}</div>
                </div>
                <div className="book-details">
                  <div className="book-category">{book.category}</div>
                  <h3 className="book-title">{book.title}</h3>
                  <div className="book-price">
                    {book.discount > 0 ? (
                      <>
                        <span className="original-price">
                          ${(book.originalPrice || (book.price * 100 / (100 - book.discount))).toFixed(2)}
                        </span>
                        <span className="sale-price">${typeof book.price === 'number' ? book.price.toFixed(2) : book.price}</span>
                      </>
                    ) : (
                      <span className="regular-price">${typeof book.price === 'number' ? book.price.toFixed(2) : book.price}</span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="see-all-books">
          <Button variant="outline" className="shop-all-btn">Shop All Books</Button>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <h2>Be the first to know</h2>
        <p>
          Lectus amet scelerisque fusce est venenatis, eget enim dolor
          amet vitae pharetra
        </p>
        <div className="newsletter-form">
          <Input type="email" placeholder="Your email address" className="newsletter-input" />
          <Button className="subscribe-btn">Subscribe</Button>
        </div>
      </section>
    </>
  );
}
