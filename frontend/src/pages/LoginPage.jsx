import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LoginPage.css";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Link } from "react-router-dom";
import { Mail, Lock, LogIn, BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check if there's a success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the location state after reading
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      // The auth context will update isAuthenticated, which will trigger the redirect
    } catch (error) {
      console.error("Login failed:", error);
      // More detailed error message handling
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError(error.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h1 className="login-title">Đăng nhập</h1>
        
        {successMessage && (
          <div className="login-success-message">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="login-error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <label htmlFor="password">Mật khẩu</label>
            <Link to="/forgot-password" className="login-forgot">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              "Đang xử lý..."
            ) : (
              <>
                Đăng nhập
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="login-link">
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

  

