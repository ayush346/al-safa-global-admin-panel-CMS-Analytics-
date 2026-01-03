import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiMail, 
  FiMapPin, 
  FiPhone 
} from 'react-icons/fi';
import './Footer.css';
import { useContent } from '../context/ContentContext';
import { toText } from '../utils/cms';

const Footer = () => {
  const { footer = {} } = useContent();
  const currentYear = new Date().getFullYear();
  const emails = Array.isArray(footer.emails) ? footer.emails : [];
  const phones = Array.isArray(footer.phones) ? footer.phones : [];
  const locationText = footer.locationText;
  const quickLinks = Array.isArray(footer.quickLinks) ? footer.quickLinks : [];
  const services = Array.isArray(footer.services) ? footer.services : [];
  const footerImage = footer.footerImage;
  const legal = footer.legal;

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
                <div className="contact-phones">
                  {emails.map((e) => (
                    <div key={e}>
                      <a href={`mailto:${e}`} className="contact-link">{e}</a>
                    </div>
                  ))}
                </div>
              </div>
              <div className="contact-item">
                <FiPhone className="contact-icon" />
                <div className="contact-phones">
                  {phones.map((p, idx) => (
                    <div key={p}>
                      <span>{idx === 0 ? 'Office:' : 'Mobile:'} </span>
                      <a href={`tel:${p.replace(/\s/g, '')}`} className="contact-link">{p}</a>
                    </div>
                  ))}
                </div>
              </div>
              <div className="contact-item">
                <FiMapPin className="contact-icon" />
                {locationText && <span data-cms-key="footer.locationText">{locationText}</span>}
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
            <ul className="footer-links" data-cms-list="footer.quickLinks">
              {quickLinks.map((l) => (
                <li key={l.path} data-cms-item>
                  <span data-cms-field="label" style={{ display: 'none' }}>{l.label}</span>
                  <span data-cms-field="path" style={{ display: 'none' }}>{l.path}</span>
                  <Link to={l.path}>{l.label}</Link>
                </li>
              ))}
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
            <ul className="footer-links" data-cms-list="footer.services">
              {services.map((s, idx) => (
                <li key={`${s}-${idx}`} data-cms-item>
                  <span data-cms-field="text" style={{ display: 'none' }}>{toText(s)}</span>
                  {toText(s)}
                </li>
              ))}
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
              {footerImage && (
              <img 
                src={footerImage}
                alt="Al Safa Global" 
                className="footer-image"
              />
              )}
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
            <p>&copy; {currentYear} {legal && <span data-cms-key="footer.legal">{legal}</span>}</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer; 