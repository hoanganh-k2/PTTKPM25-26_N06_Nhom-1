import { useState } from "react";
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
import { Mail, Lock, LogIn, BookOpen, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual login with API
      console.log("Login with:", { email, password });
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect to home on successful login
      // navigate('/');
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h1 className="login-title">Đăng nhập</h1>
        
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
            <a href="/forgot-password" className="login-forgot">
              Quên mật khẩu?
            </a>
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
            <a href="/register" className="login-link">
              Đăng ký
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

  

