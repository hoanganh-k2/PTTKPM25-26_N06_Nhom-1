import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";
import { Link } from "react-router-dom";
import { User, Mail, Lock, Check, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

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
    setApiError("");

    try {
      // Extract only the required fields
      const { fullName, email, password } = formData;
      await register({ fullName, email, password });
      
      // Show success message and redirect to login
      navigate("/login", { 
        state: { message: "Đăng ký thành công! Vui lòng đăng nhập." } 
      });
    } catch (error) {
      console.error("Registration failed:", error);
      // More detailed error message handling
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError(error.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
      }
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

          {apiError && (
            <p className="register-error api-error">{apiError}</p>
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
            <Link to="/login" className="register-link">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
