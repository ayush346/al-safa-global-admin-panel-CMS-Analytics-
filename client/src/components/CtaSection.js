import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './CtaSection.css';
import { useContent } from '../context/ContentContext';

const CtaSection = () => {
  const { home = {} } = useContent();
  const cta = home.cta || {};
  const primary = cta.primary;
  const secondary = cta.secondary;
  return (
    <section className="cta-section">
      <div className="container">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {cta.title && <h2 data-cms-key="home.cta.title">{cta.title}</h2>}
          {cta.text && (
            <p data-cms-key="home.cta.text">
              {cta.text}
            </p>
          )}
          <div className="cta-buttons">
            {primary?.href && primary?.label && (
              <>
                <Link to={primary.href} className="btn btn-primary">
                  <span data-cms-key="home.cta.primary.label">{primary.label}</span>
                  <FiArrowRight />
                </Link>
                <span style={{ display: 'none' }} data-cms-key="home.cta.primary.href">{primary.href}</span>
              </>
            )}
            {secondary?.href && secondary?.label && (
              <>
                <Link to={secondary.href} className="btn btn-outline">
                  <span data-cms-key="home.cta.secondary.label">{secondary.label}</span>
                </Link>
                <span style={{ display: 'none' }} data-cms-key="home.cta.secondary.href">{secondary.href}</span>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection; 