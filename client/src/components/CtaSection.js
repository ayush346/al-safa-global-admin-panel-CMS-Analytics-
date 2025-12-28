import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './CtaSection.css';

const CtaSection = () => {
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
          <h2>Ready to Get Started?</h2>
          <p>
            Let's discuss how Al Safa Global can help you with your procurement and supply chain needs.
          </p>
          <div className="cta-buttons">
            <Link to="/quote" className="btn btn-primary">
              Get a Quote
              <FiArrowRight />
            </Link>
            <Link to="/divisions" className="btn btn-outline">
              Explore Our Divisions
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection; 