import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import './Header.css';
import { useEditMode } from '../context/EditModeContext';
import { toast } from 'react-hot-toast';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isEditMode, setEditMode } = useEditMode();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Segments', path: '/divisions' },
    { name: 'Contact', path: '/contact' },
    { name: 'Admin', path: '/admin' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.header 
      className={`header ${isScrolled ? 'scrolled' : ''} ${isEditMode ? 'editing-mode' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container">
        <div className="header-content">
          {/* Logo */}
          <motion.div 
            className="logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/">
              <div className="logo-container">
                <div className="logo-icon">
                  <img 
                    src={process.env.PUBLIC_URL + "/images/logo.png"} 
                    alt="Al Safa Global Logo" 
                    className="logo-image"
                    onLoad={() => console.log('Logo loaded successfully')}
                    onError={(e) => {
                      console.error('Error loading logo:', e);
                      console.error('Attempted URL:', process.env.PUBLIC_URL + "/images/logo.png");
                    }}
                  />
                </div>
                <div className="logo-text-container">
                  <span className="company-name">Al Safa Global</span>
                  <span className="company-tagline">General Trading FZ LLC</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <ul className="nav-list">
              {navItems.map((item, index) => (
                <motion.li 
                  key={item.name}
                  className="nav-item"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    to={item.path}
                    className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* CTA / Edit Mode Controls */}
          <motion.div 
            className="header-cta"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isEditMode ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    toast.success('Saved (prototype): changes will persist while the page is open');
                  }}
                >
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  disabled
                  title="Disabled in prototype"
                >
                  Host
                </button>
                <Link to="/analytics" className="btn btn-secondary">
                  Analytics
                </Link>
                <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                  Exit
                </button>
              </div>
            ) : (
              <Link to="/quote" className="btn btn-primary">
                Get Quote
              </Link>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            className="mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiX />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiMenu />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="mobile-nav"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <nav className="nav-mobile">
                <ul className="mobile-nav-list">
                  {navItems.map((item, index) => (
                    <motion.li 
                      key={item.name}
                      className="mobile-nav-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link 
                        to={item.path}
                        className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                      >
                        {item.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
                <motion.div 
                  className="mobile-cta"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link to="/quote" className="btn btn-primary btn-large">
                    Get Quote
                  </Link>
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header; 