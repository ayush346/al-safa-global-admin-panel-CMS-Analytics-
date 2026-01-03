import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './HeroSection.css';
import { useContent } from '../context/ContentContext';

const HeroSection = () => {
  const { hero = {} } = useContent();
  return (
    <>
      {/* Landing Page Banner Image */}
      <section className="landing-banner">
        <img 
          src={hero.bannerImage || (process.env.PUBLIC_URL + "/images/hero-landing-image.jpg")} 
          alt="Al Safa Global - Global Procurement Solutions" 
          className="landing-banner-image"
          onLoad={() => console.log('Hero landing image loaded successfully from:', process.env.PUBLIC_URL + "/images/hero-landing-image.jpg")}
          onError={(e) => {
            console.error('Error loading hero landing image:', e);
            console.error('Attempted URL:', hero.bannerImage || (process.env.PUBLIC_URL + "/images/hero-landing-image.jpg"));
            console.error('PUBLIC_URL:', process.env.PUBLIC_URL);
          }}
        />
      </section>
      
      <section className="hero-section">
      <div className="hero-background">
        <div className="hero-pattern"></div>
        <div className="hero-overlay"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
          <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {hero.titlePrefix && <span data-cms-key="hero.titlePrefix">{hero.titlePrefix}</span>}{' '}
              {hero.brandHighlight && <span className="gradient-text" data-cms-key="hero.brandHighlight">{hero.brandHighlight}</span>}
            </motion.h1>
            
            <motion.p 
              className="hero-subtitle-stylish"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {hero.subtitle && <span data-cms-key="hero.subtitle">{hero.subtitle}</span>}
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {(Array.isArray(hero.paragraphs) && hero.paragraphs[0])}
            </motion.p>
            
            {/* Mobile-only image display */}
            <motion.div 
              className="hero-visual-mobile"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <div className="hero-image-container">
                <div className="hero-main-image">
                  <img 
                    src={hero.mainImage || (process.env.PUBLIC_URL + "/images/global-procurement.png")} 
                    alt="Global Procurement Solutions" 
                    className="hero-image"
                    onLoad={() => console.log('Mobile global procurement image loaded successfully')}
                    onError={(e) => {
                      console.error('Error loading mobile global procurement image:', e);
                      console.error('Attempted URL:', hero.mainImage || (process.env.PUBLIC_URL + "/images/global-procurement.png"));
                    }}
                  />
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="hero-actions"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              {hero.primaryCta?.href && hero.primaryCta?.label && (
                <Link to={hero.primaryCta.href} className="btn btn-primary btn-large">
                  {hero.primaryCta.label}
                  <FiArrowRight />
                </Link>
              )}
              {hero.secondaryCta?.href && hero.secondaryCta?.label && (
                <Link to={hero.secondaryCta.href} className="btn btn-secondary btn-large">
                  {hero.secondaryCta.label}
                  <FiArrowRight />
                </Link>
              )}
            </motion.div>
            
            <motion.div 
              className="hero-stats"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              {(Array.isArray(hero.stats) ? hero.stats : []).map((s, idx) => (
                <div className="stat-item" key={`${s.label}-${idx}`}>
                  <span className="stat-number">{s.number}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="hero-image-container">
              <div className="hero-main-image">
                <img 
                  data-cms-key="hero.mainImage"
                  data-cms-type="image"
                  src={hero.mainImage || (process.env.PUBLIC_URL + "/images/global-procurement.png")} 
                  alt="Global Procurement Solutions" 
                  className="hero-image"
                  onLoad={() => console.log('Desktop global procurement image loaded successfully')}
                  onError={(e) => {
                    console.error('Error loading desktop global procurement image:', e);
                    console.error('Attempted URL:', hero.mainImage || (process.env.PUBLIC_URL + "/images/global-procurement.png"));
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
      >
        <motion.div 
          className="scroll-arrow"
          animate={{ y: [0, 10, 0] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          ↓
        </motion.div>
        <span>Scroll to explore</span>
      </motion.div>
    </section>
    </>
  );
};

export default HeroSection; 