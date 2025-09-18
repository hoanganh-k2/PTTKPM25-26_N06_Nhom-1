import { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập khi component được mount
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    setCurrentUser(response.user);
    return response;
  };

  const register = async (userData) => {
    // Let auth.service handle the filtering of properties
    return await authService.register(userData);
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Kiểm tra vai trò người dùng
  const isAdmin = currentUser?.isAdmin || currentUser?.role === 'admin';
  const isWarehouseManager = currentUser?.role === 'warehouse_manager';

  const value = {
    user: currentUser, // Add user alias for compatibility with Navbar
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    isAdmin,
    isWarehouseManager,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
