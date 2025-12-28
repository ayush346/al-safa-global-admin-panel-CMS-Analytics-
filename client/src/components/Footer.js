import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiMail, 
  FiMapPin, 
  FiPhone 
} from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="footer-logo">
              <h3>Al Safa Global</h3>
            </div>
            <div className="footer-contact">
              <div className="contact-item">
                <FiMail className="contact-icon" />
                <a href="mailto:info@alsafaglobal.com" className="contact-link">
                  info@alsafaglobal.com
                </a>
              </div>
              <div className="contact-item">
                <FiPhone className="contact-icon" />
                <div className="contact-phones">
                  <div>
                    <span>Office: </span><a href="tel:0097143741969" className="contact-link">00971 4 3741 969</a>
                  </div>
                  <div>
                    <span>Mobile:</span><a href="tel:00971505671441" className="contact-link">00971 50 5671441</a>
                  </div>
                </div>
              </div>
              <div className="contact-item">
                <FiMapPin className="contact-icon" />
                <span>Ras Al Khaimah, UAE</span>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/divisions">Segments</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div 
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4>Our Services</h4>
            <ul className="footer-links">
              <li>Office, Construction & Infrastructure</li>
              <li>Oil & Gas</li>
              <li>Industrial & Manufacturing</li>
              <li>Aviation & Marine</li>
              <li>Defence Sector</li>
            </ul>
          </motion.div>

          {/* Footer Image */}
          <motion.div 
            className="footer-section footer-image-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="footer-image-wrapper">
              <img 
                src="/images/footer-image.jpg" 
                alt="Al Safa Global" 
                className="footer-image"
              />
            </div>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <motion.div 
          className="footer-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} Al Safa Global General Trading FZ LLC. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 