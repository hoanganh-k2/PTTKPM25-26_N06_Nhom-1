import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle } from 'lucide-react';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Địa chỉ",
      content: "số 34, đường lê trọng tấn, La Khê, Hà Đông"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Điện thoại",
      content: "+84 123 456 789"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      content: "hoanganh@gmail.com"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Giờ làm việc",
      content: "T2-T7: 8:00 - 22:00\nCN: 9:00 - 21:00"
    }
  ];

  const faqs = [
    {
      question: "Làm thế nào để đặt hàng?",
      answer: "Bạn có thể đặt hàng trực tuyến trên website hoặc gọi điện đến hotline của chúng tôi."
    },
    {
      question: "Thời gian giao hàng bao lâu?",
      answer: "Thời gian giao hàng từ 1-3 ngày làm việc đối với nội thành và 3-5 ngày cho các tỉnh khác."
    },
    {
      question: "Có chính sách đổi trả không?",
      answer: "Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày với điều kiện sách còn nguyên vẹn."
    },
    {
      question: "Có hỗ trợ thanh toán trực tuyến?",
      answer: "Có, chúng tôi hỗ trợ thanh toán qua thẻ ATM, Visa/MasterCard và ví điện tử."
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <h1>Liên hệ với chúng tôi</h1>
            <p>
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. 
              Hãy để lại tin nhắn hoặc liên hệ trực tiếp với chúng tôi.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="contact-main">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              <h2>Thông tin liên hệ</h2>
              <div className="info-cards">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="info-card">
                    <CardContent>
                      <div className="info-icon">
                        {info.icon}
                      </div>
                      <div className="info-content">
                        <h3>{info.title}</h3>
                        <p>{info.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>  
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <Card className="contact-form-card">
                <CardContent>
                  <div className="form-header">
                    <MessageCircle className="w-8 h-8" />
                    <h2>Gửi tin nhắn cho chúng tôi</h2>
                    <p>Điền thông tin bên dưới và chúng tôi sẽ phản hồi sớm nhất</p>
                  </div>

                  {submitted && (
                    <div className="success-message">
                      <div className="success-icon">✓</div>
                      <p>Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong 24h.</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">Họ và tên *</label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nhập họ và tên"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Nhập địa chỉ email"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="subject">Chủ đề *</label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="form-select"
                          required
                        >
                          <option value="">Chọn chủ đề</option>
                          <option value="general">Câu hỏi chung</option>
                          <option value="order">Đặt hàng</option>
                          <option value="support">Hỗ trợ kỹ thuật</option>
                          <option value="feedback">Góp ý</option>
                          <option value="partnership">Hợp tác kinh doanh</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Tin nhắn *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Nhập nội dung tin nhắn..."
                        rows="5"
                        className="form-textarea"
                        required
                      ></textarea>
                    </div>

                    <Button 
                      type="submit" 
                      className="submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="loading-spinner"></div>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Gửi tin nhắn
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <h2>Câu hỏi thường gặp</h2>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <Card key={index} className="faq-card">
                <CardContent>
                  <h3>{faq.question}</h3>
                  <p>{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="quick-contact">
        <div className="container">
          <div className="quick-contact-content">
            <h2>Cần hỗ trợ ngay?</h2>
            <p>Liên hệ hotline để được tư vấn trực tiếp</p>
            <div className="quick-contact-buttons">
              <Button className="hotline-btn">
                <Phone className="w-4 h-4" />
                Hotline: 1900 1234
              </Button>
              <Button variant="outline" className="email-btn">
                <Mail className="w-4 h-4" />
                Email: hoanganh@gmail.com
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}