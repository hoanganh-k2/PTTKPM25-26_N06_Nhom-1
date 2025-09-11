import { useState } from "react";
import "./RegisterPage.css";
import { User, Mail, Lock, Check, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for this field when user starts typing again
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement actual registration with API
      console.log("Register with:", formData);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to login on successful registration
      // navigate('/login');
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-bg">
      <div className="register-card">
        <h1 className="register-title">Đăng ký tài khoản</h1>
        
        <form onSubmit={handleSubmit} className="register-form">
          <label htmlFor="fullName">Họ và tên</label>
          <div className="input-wrapper">
            <User className="input-icon" size={18} />
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>
          {errors.fullName && (
            <p className="register-error">{errors.fullName}</p>
          )}

          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <p className="register-error">{errors.email}</p>}

          <label htmlFor="password">Mật khẩu</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          {errors.password && <p className="register-error">{errors.password}</p>}

          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <div className="input-wrapper">
            <Check className="input-icon" size={18} />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          {errors.confirmPassword && (
            <p className="register-error">{errors.confirmPassword}</p>
          )}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? (
              "Đang xử lý..."
            ) : (
              <>
                Đăng ký
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm">
            Đã có tài khoản?{" "}
            <a href="/login" className="register-link">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
