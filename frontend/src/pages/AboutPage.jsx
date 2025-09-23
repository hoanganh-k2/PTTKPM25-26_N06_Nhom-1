import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { BookOpen, Users, Award, Heart, Target, Eye } from 'lucide-react';
import './AboutPage.css';

export default function AboutPage() {
  const [stats, setStats] = useState({
    booksCount: 0,
    authorsCount: 0,
    customersCount: 0,
    yearsCount: 0
  });

  useEffect(() => {
    // Animate numbers on page load
    const animateValue = (start, end, duration, setValue) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        setValue(Math.floor(progress * (end - start) + start));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    setTimeout(() => {
      animateValue(0, 5000, 2000, (val) => setStats(prev => ({ ...prev, booksCount: val })));
      animateValue(0, 200, 2000, (val) => setStats(prev => ({ ...prev, authorsCount: val })));
      animateValue(0, 10000, 2000, (val) => setStats(prev => ({ ...prev, customersCount: val })));
      animateValue(0, 15, 2000, (val) => setStats(prev => ({ ...prev, yearsCount: val })));
    }, 500);
  }, []);

  const values = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Chất lượng",
      description: "Chúng tôi cam kết mang đến những cuốn sách chất lượng cao từ các tác giả uy tín."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Khách hàng là trung tâm",
      description: "Đặt nhu cầu và sự hài lòng của khách hàng lên hàng đầu trong mọi hoạt động."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Uy tín",
      description: "Xây dựng niềm tin thông qua dịch vụ chuyên nghiệp và sản phẩm đáng tin cậy."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Đam mê",
      description: "Tình yêu với sách và tri thức là động lực thúc đẩy chúng tôi không ngừng phát triển."
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>Về chúng tôi</h1>
          <p className="hero-subtitle">
            Hành trình lan tỏa tri thức và nuôi dưỡng tình yêu đọc sách
          </p>
        </div>
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
            alt="BookStore Library"
          />
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Câu chuyện của chúng tôi</h2>
              <p>
                BookStore được thành lập vào năm 2010 với sứ mệnh đơn giản nhưng ý nghĩa: 
                mang tri thức đến gần hơn với mọi người. Từ một cửa hàng sách nhỏ, 
                chúng tôi đã phát triển thành một trong những nhà phân phối sách 
                trực tuyến uy tín hàng đầu Việt Nam.
              </p>
              <p>
                Với đội ngũ nhân viên tận tâm và am hiểu sâu sắc về sách, 
                chúng tôi không chỉ bán sách mà còn tư vấn, gợi ý những tác phẩm 
                phù hợp với từng độc giả. Mỗi cuốn sách chúng tôi chọn lọc đều 
                mang trong mình giá trị văn hóa và tri thức đích thực.
              </p>
            </div>
            <div className="story-image">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Our founder"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="container">
          <div className="mv-grid">
            <Card className="mission-card">
              <CardContent>
                <div className="mv-icon">
                  <Target className="w-12 h-12" />
                </div>
                <h3>Sứ mệnh</h3>
                <p>
                  Làm cho việc đọc sách trở nên dễ dàng, thú vị và có ý nghĩa. 
                  Chúng tôi muốn mỗi người Việt Nam đều có cơ hội tiếp cận 
                  với những tác phẩm hay nhất từ khắp nơi trên thế giới.
                </p>
              </CardContent>
            </Card>
            <Card className="vision-card">
              <CardContent>
                <div className="mv-icon">
                  <Eye className="w-12 h-12" />
                </div>
                <h3>Tầm nhìn</h3>
                <p>
                  Trở thành nền tảng số 1 về sách tại Việt Nam, nơi kết nối 
                  tác giả, nhà xuất bản và độc giả trong một cộng đồng yêu 
                  tri thức và sáng tạo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="container">
          <h2>Thành tựu của chúng tôi</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.booksCount.toLocaleString()}+</div>
              <div className="stat-label">Đầu sách</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.authorsCount.toLocaleString()}+</div>
              <div className="stat-label">Tác giả</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.customersCount.toLocaleString()}+</div>
              <div className="stat-label">Khách hàng</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.yearsCount}+</div>
              <div className="stat-label">Năm kinh nghiệm</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <h2>Giá trị cốt lõi</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <Card key={index} className="value-card">
                <CardContent>
                  <div className="value-icon">
                    {value.icon}
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Hãy cùng chúng tôi khám phá thế giới tri thức</h2>
            <p>
              Tham gia cộng đồng độc giả của BookStore và khám phá những cuốn sách tuyệt vời
            </p>
            <div className="cta-buttons">
              <Link to="/books">
                <Button className="cta-primary">Khám phá sách</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="cta-secondary">Liên hệ với chúng tôi</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}