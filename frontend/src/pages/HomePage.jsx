import { useState } from "react";
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
      image: "https://placehold.co/200x300",
    },
    {
      id: 2,
      title: "Nhà Giả Kim",
      author: "Paulo Coelho",
      price: 90000,
      image: "https://placehold.co/200x300",
    },
    {
      id: 3,
      title: "Cây Cam Ngọt Của Tôi",
      author: "José Mauro de Vasconcelos",
      price: 115000,
      image: "https://placehold.co/200x300",
    },
    {
      id: 4,
      title: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
      author: "Nguyễn Nhật Ánh",
      price: 85000,
      image: "https://placehold.co/200x300",
    },
  ];

  // Mock data for bestselling books
  const bestsellingBooks = [
    {
      id: 5,
      title: "Không Gia Đình",
      author: "Hector Malot",
      price: 150000,
      image: "https://placehold.co/200x300",
    },
    {
      id: 6,
      title: "Dế Mèn Phiêu Lưu Ký",
      author: "Tô Hoài",
      price: 78000,
      image: "https://placehold.co/200x300",
    },
    {
      id: 7,
      title: "Chí Phèo",
      author: "Nam Cao",
      price: 65000,
      image: "https://placehold.co/200x300",
    },
    {
      id: 8,
      title: "Số Đỏ",
      author: "Vũ Trọng Phụng",
      price: 95000,
      image: "https://placehold.co/200x300",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="bg-primary-50 rounded-lg p-6 mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            Chào mừng đến với Hiệu Sách Online
          </h1>
          <p className="text-lg mb-6">
            Khám phá hàng ngàn đầu sách hay với giá tốt nhất
          </p>

          <div className="flex max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Tìm kiếm sách, tác giả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-r-none"
            />
            <Button className="rounded-l-none">Tìm kiếm</Button>
          </div>
        </div>
      </section>

      {/* New Releases Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Sách Mới Nhất</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="aspect-[2/3] relative">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent>
                <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                <p className="text-gray-600">{book.author}</p>
                <p className="font-bold text-primary mt-2">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(book.price)}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Thêm vào giỏ hàng</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Sách Bán Chạy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestsellingBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="aspect-[2/3] relative">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent>
                <CardTitle className="line-clamp-1">{book.title}</CardTitle>
                <p className="text-gray-600">{book.author}</p>
                <p className="font-bold text-primary mt-2">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(book.price)}
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Thêm vào giỏ hàng</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
