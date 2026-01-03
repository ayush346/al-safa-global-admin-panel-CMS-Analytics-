import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './CtaSection.css';
import { useContent } from '../context/ContentContext';
import { toText } from '../utils/cms';

const CtaSection = () => {
  const { home = {} } = useContent();
  // Phase-8 CMS migration — Home CTA is now fully CMS-driven with no static fallback.
  const cta = home.cta || {};
  const title = toText(cta.title);
  const text = toText(cta.text);
  const primary = {
    label: toText(cta.primary?.label),
    href: toText(cta.primary?.href)
  };
  const secondary = {
    label: toText(cta.secondary?.label),
    href: toText(cta.secondary?.href)
  };
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
          <h2 data-cms-key="home.cta.title">{title}</h2>
          <p data-cms-key="home.cta.text">
            {text}
          </p>
          <div className="cta-buttons">
            <Link to={primary.href} className="btn btn-primary">
              <span data-cms-key="home.cta.primary.label">{primary.label}</span>
              <FiArrowRight />
            </Link>
            <span style={{ display: 'none' }} data-cms-key="home.cta.primary.href">{primary.href}</span>
            <Link to={secondary.href} className="btn btn-outline">
              <span data-cms-key="home.cta.secondary.label">{secondary.label}</span>
            </Link>
            <span style={{ display: 'none' }} data-cms-key="home.cta.secondary.href">{secondary.href}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection; 