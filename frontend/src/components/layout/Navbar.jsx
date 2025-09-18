import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './navbar-cart.css';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  const isActive = (path) => {
    return location.pathname === path ? 'active-nav-link' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <h1>BookStore</h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="desktop-nav">
          <div className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Home
            </Link>
            <Link to="/books" className={`nav-link ${isActive('/books')}`}>
              Books
            </Link>
            <Link to="/about" className={`nav-link ${isActive('/about')}`}>
              About
            </Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact')}`}>
              Contact
            </Link>
            <Link to="/cart" className={`nav-link cart-link ${isActive('/cart')}`}>
              Giỏ hàng
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </Link>
          </div>

          <div className="nav-auth">
            {user ? (
              <div className="user-menu">
                <span className="user-greeting">Hello, {user.name}</span>
                <Link to="/profile" className="nav-link">My Account</Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={logout} 
                  className="logout-btn"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="mobile-nav-toggle">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-links">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isActive('/')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/books" 
              className={`mobile-nav-link ${isActive('/books')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Books
            </Link>
            <Link 
              to="/about" 
              className={`mobile-nav-link ${isActive('/about')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/cart" 
              className={`mobile-nav-link ${isActive('/cart')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Giỏ hàng {totalItems > 0 && `(${totalItems})`}
            </Link>
            <Link 
              to="/contact" 
              className={`mobile-nav-link ${isActive('/contact')}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>

            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/profile" 
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <button 
                  className="mobile-nav-link logout-link"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
