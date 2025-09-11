import { useState } from "react";
import "./HomePage.css";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for featured books
  const featuredBooks = [
    {
      id: 1,
      title: "Đắc Nhân Tâm",
      author: "Dale Carnegie",
      price: 120000,
      image: "https://salt.tikicdn.com/cache/750x750/ts/product/ff/7e/bf/89ccc17416ae1f9e3478e8851264f21f.jpg.webp",
      discount: 15,
    },
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
      id: 4,
      title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
      author: "Nguyễn Nhật Ánh",
      price: 85000,
      image: "https://salt.tikicdn.com/cache/750x750/ts/product/2e/ae/d3/312eac4fa8264c2330c993731b3d874f.jpg.webp",
      discount: 12,
    },
  ];

  // Mock data for bestselling books
  const bestsellingBooks = [
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
      title: "Số Đỏ",
      author: "Vũ Trọng Phụng",
      price: 95000,
      image: "https://salt.tikicdn.com/cache/750x750/ts/product/99/20/e0/db1f931956bbafc394135aab700346f2.jpg.webp",
      discount: 15,
    },
  ];

  return (
    <>
      <div className="home-hero">
        <h1>Khám Phá Thế Giới Sách</h1>
        <p>Hàng ngàn đầu sách hay với giá tốt nhất, giao hàng nhanh chóng</p>
        <a href="#new-books" className="home-cta">Khám phá ngay</a>
      </div>
      <div className="home-section">
        <div className="home-books">
          {['Văn Học', 'Kinh Tế', 'Thiếu Nhi', 'Ngoại Ngữ'].map((category, index) => (
            <div 
              key={index} 
              className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg p-6 text-white text-center cursor-pointer hover:shadow-lg transition-all"
            >
              <h3 className="font-bold text-lg mb-2">{category}</h3>
              <p className="text-blue-100 text-sm">Xem tất cả</p>
            </div>
          ))}
        </div>
      </div>

      {/* New Releases Section */}
      <section className="home-section">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="inline-block border-b-4 border-blue-500 pb-1">Sách Mới Nhất</span>
          </h2>
          <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
            Xem thêm
          </Button>
        </div>
        <div className="home-books">
          {featuredBooks.map((book) => (
            <Card key={book.id} className="home-book-card group">
              <div className="aspect-[2/3] relative overflow-hidden bg-gray-100">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {book.discount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    -{book.discount}%
                  </span>
                )}
              </div>
              <CardContent className="pt-4">
                <h3 className="home-book-title group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h3>
                <p className="home-book-author">{book.author}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="home-book-price">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(book.price * (1 - book.discount/100))}
                  </p>
                  {book.discount > 0 && (
                    <p className="text-gray-400 text-sm line-through">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(book.price)}
                    </p>
                  )}
                </div>
                <div className="mt-1 flex items-center text-sm">
                  <div className="flex text-yellow-400">
                    {'★★★★☆'}
                  </div>
                  <span className="ml-1 text-gray-500">(120)</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Thêm vào giỏ hàng
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="home-section">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            <span className="inline-block border-b-4 border-blue-500 pb-1">Sách Bán Chạy</span>
          </h2>
          <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
            Xem thêm
          </Button>
        </div>
        <div className="home-books">
          {bestsellingBooks.map((book) => (
            <Card key={book.id} className="home-book-card group">
              <div className="aspect-[2/3] relative overflow-hidden bg-gray-100">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {book.discount > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    -{book.discount}%
                  </span>
                )}
                <span className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">
                  Bán chạy
                </span>
              </div>
              <CardContent className="pt-4">
                <h3 className="home-book-title group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h3>
                <p className="home-book-author">{book.author}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="home-book-price">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(book.price * (1 - book.discount/100))}
                  </p>
                  {book.discount > 0 && (
                    <p className="text-gray-400 text-sm line-through">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(book.price)}
                    </p>
                  )}
                </div>
                <div className="mt-1 flex items-center text-sm">
                  <div className="flex text-yellow-400">
                    {'★★★★★'}
                  </div>
                  <span className="ml-1 text-gray-500">(215)</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Thêm vào giỏ hàng
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Promo Section */}
      <section className="home-section">
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <pattern id="books-pattern" patternUnits="userSpaceOnUse" width="100" height="100">
                  <path d="M20,10 L80,10 L80,90 L20,90 Z" stroke="white" fill="none"/>
                  <path d="M30,20 L70,20 L70,80 L30,80 Z" stroke="white" fill="none"/>
                  <path d="M40,30 L60,30 L60,70 L40,70 Z" stroke="white" fill="none"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#books-pattern)" />
            </svg>
          </div>
          <div className="md:w-3/4 lg:w-2/3 relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Đăng ký nhận thông tin</h3>
            <p className="text-blue-100 mb-6">Đăng ký để nhận thông tin về sách mới và ưu đãi đặc biệt mỗi tuần.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                className="bg-white border-0"
              />
              <Button className="bg-white text-blue-600 hover:bg-blue-50">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
