import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, BarChart3, Camera, Tag, Settings } from 'lucide-react';
import './Layout.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', path: '/', icon: BarChart3 },
    { label: 'Pemindai Struk', path: '/scanner', icon: Camera },
    { label: 'Kategorisasi', path: '/categorization', icon: Tag },
  ];

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="header-brand">
            <span className="brand-icon">💼</span>
            <span className="brand-name">KantongKu</span>
          </Link>

          <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="header-actions">
            <button className="header-action-btn">
              <Settings size={20} />
            </button>
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}
    </>
  );
};

export default Header;
