import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { useEditMode } from '../context/EditModeContext';
import { 
  FiArrowRight, 
  FiShield, 
  FiGlobe, 
  FiClock, 
  FiUsers, 
  FiAward,
  FiTruck,
  FiTrendingUp,
  FiCheckCircle,
  FiPackage,
  FiLink
} from 'react-icons/fi';
import HeroSection from '../components/HeroSection';
import FeatureCard from '../components/FeatureCard';
import DivisionCard from '../components/DivisionCard';
import StatsSection from '../components/StatsSection';
import TestimonialSection from '../components/TestimonialSection';
import CtaSection from '../components/CtaSection';
import './Home.css';
import { ConfirmDialog, useConfirmState } from '../components/ConfirmDialog';
import { useContent } from '../context/ContentContext';
import { useDraftList } from '../hooks/useDraftList';
import { toText } from '../utils/cms';

const Home = () => {
  const { content } = useContent();
  const { isEditMode, isDisabled, disableContent, enableContent } = useEditMode();
  const { confirmState, askConfirm, handleConfirm, handleCancel } = useConfirmState();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  
  const [cardsScrolled, setCardsScrolled] = React.useState({
    card1: false,
    card2: false,
    card3: false,
    card4: false,
    card5: false
  });

  const [lastScrollY, setLastScrollY] = React.useState(0);
  const [hasTransitioned, setHasTransitioned] = React.useState(false);

  // Check if user is revisiting the home page
  useEffect(() => {
    const hasVisitedOtherPages = sessionStorage.getItem('hasVisitedOtherPages');
    if (hasVisitedOtherPages === 'true') {
      // Reset cards if user is revisiting after visiting other pages
      setCardsScrolled({
        card1: false,
        card2: false,
        card3: false,
        card4: false,
        card5: false
      });
      setHasTransitioned(false);
      sessionStorage.removeItem('hasVisitedOtherPages');
    }
  }, []);

  // Track when user leaves home page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (hasTransitioned) {
        sessionStorage.setItem('hasVisitedOtherPages', 'true');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasTransitioned) {
        sessionStorage.setItem('hasVisitedOtherPages', 'true');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasTransitioned]);

  // Handle scroll effect for floating cards in mobile
  useEffect(() => {
    const handleScroll = () => {
      const cardsContainer = document.querySelector('.image-container');
      if (cardsContainer) {
        const rect = cardsContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY > lastScrollY;
        
        // Check if cards are in viewport (mobile only)
        if (window.innerWidth <= 767) {
          if (rect.top < windowHeight * 0.8 && rect.bottom > 0) {
            // Only trigger transitions when scrolling down and haven't transitioned yet
            if (isScrollingDown && !hasTransitioned) {
              // Trigger cards one by one with staggered timing
              setTimeout(() => setCardsScrolled(prev => ({ ...prev, card1: true })), 0);
              setTimeout(() => setCardsScrolled(prev => ({ ...prev, card2: true })), 200);
              setTimeout(() => setCardsScrolled(prev => ({ ...prev, card3: true })), 400);
              setTimeout(() => setCardsScrolled(prev => ({ ...prev, card4: true })), 600);
              setTimeout(() => setCardsScrolled(prev => ({ ...prev, card5: true })), 800);
              setHasTransitioned(true); // Mark as transitioned permanently
            }
          }
        }
        setLastScrollY(currentScrollY);
      }
    };

    // Only add scroll listener on mobile
    if (window.innerWidth <= 767) {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Check initial state
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, hasTransitioned]);

  const iconMap = {
    'globe': <FiGlobe />,
    'truck': <FiTruck />,
    'trending-up': <FiTrendingUp />,
    'clock': <FiClock />,
    'users': <FiUsers />,
    'shield': <FiShield />
  };
  const mapFeatureIcon = (iconKey) => iconMap[iconKey] || <FiCheckCircle />;
  const serializeFeature = (f, idx) => ({
    icon: (typeof f.icon === 'string' ? f.icon : (content?.home?.features?.[idx]?.icon || '')),
    title: f.title,
    description: f.description
  });
  const deserializeFeature = (f) => ({
    icon: mapFeatureIcon(f.icon),
    title: toText(f.title),
    description: toText(f.description)
  });
  // Phase-2 CMS migration — Home Features now fully CMS-driven with no static fallback.
  const featuresCMS = Array.isArray(content?.home?.features)
    ? content.home.features.map(deserializeFeature)
    : [];
  // Keep draft for edit mode authoring, seeded from current CMS data
  const [featuresDraft, setFeaturesDraft] = useDraftList('home.features', featuresCMS, serializeFeature, deserializeFeature);
  const featuresToRender = isEditMode ? featuresDraft : featuresCMS;

  // Removed leftover setFeatures reference after CMS migration to avoid no-undef build error.
  const handleAddFeature = () => {
    setFeaturesDraft(prev => ([
      ...prev,
      {
        icon: "➕",
        title: "New Benefit",
        description: "Click here to edit the benefit description."
      }
    ]));
  };

  const handleRemoveFeature = (indexToRemove) => {
    askConfirm('Are you sure you want to delete this item?', () => {
      setFeaturesDraft(prev => prev.filter((_, i) => i !== indexToRemove));
    });
  };

  const fallbackDivisions = [
    {
      id: 'office-construction',
      title: 'Office, Construction & Infrastructure',
      description: 'End-to-end supply for office fit-outs, construction materials and infrastructure projects.',
      icon: '🏗️',
      color: 'var(--primary-blue)',
      link: '/divisions#office-construction'
    },
    {
      id: 'oil-gas',
      title: 'Oil & Gas',
      description: 'Equipment, spares and consumables for upstream and downstream operations.',
      icon: '🛢️',
      color: 'var(--primary-gold)',
      link: '/divisions#oil-gas'
    },
    {
      id: 'industrial-manufacturing',
      title: 'Industrial & Manufacturing',
      description: 'MRO, tooling, machinery spares and production consumables.',
      icon: '🏭',
      color: 'var(--primary-blue)',
      link: '/divisions#industrial-manufacturing'
    },
    {
      id: 'aviation-marine',
      title: 'Aviation & Marine',
      description: 'Specialized parts and supplies for aviation, marine and shipping.',
      icon: '✈️',
      color: 'var(--primary-gold)',
      link: '/divisions#aviation-marine'
    },
    {
      id: 'defence',
      title: 'Defence Sector',
      description: 'Trusted sourcing for mission‑critical and compliant defence supplies.',
      icon: '🛡️',
      color: 'var(--primary-blue)',
      link: '/divisions#defence'
    }
  ];
  // Phase-4 CMS migration — Home Divisions is now fully CMS-driven with no static fallback.
  const deserializeDivision = (d) => ({
    id: d?.id || '',
    title: toText(d?.title),
    description: toText(d?.description),
    icon: d?.icon,
    color: d?.color,
    link: d?.link
  });
  const divisionsCMS = (Array.isArray(content?.home?.divisions) ? content.home.divisions : []).map(deserializeDivision);
  // Keep draft for edit mode authoring; viewers render LIVE CMS (with fallback)
  const [divisions, setDivisions] = useDraftList(
    'home.divisions',
    divisionsCMS,
    (d) => ({ id: d.id, title: d.title, description: d.description, icon: d.icon, color: d.color, link: d.link }),
    deserializeDivision
  );
  const divisionsToRender = isEditMode ? divisions : divisionsCMS;
  const dragIndexRef = useRef(null);

  const handleAddDivision = () => {
    setDivisions(prev => ([
      ...prev,
      {
        id: `new-${Date.now()}`,
        title: "New Segment",
        description: "Click here to edit the segment description.",
        icon: "➕",
        color: "var(--primary-blue)",
        link: "/divisions"
      }
    ]));
  };

  const handleRemoveDivision = (id) => {
    askConfirm('Are you sure you want to delete this segment?', () => {
      setDivisions(prev => prev.filter(d => d.id !== id));
    });
  };

  const handleDragStart = (index) => {
    dragIndexRef.current = index;
  };

  const handleDrop = (dropIndex) => {
    const from = dragIndexRef.current;
    if (from === null || from === dropIndex) return;
    setDivisions(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    dragIndexRef.current = null;
  };

  const stats = [
    { number: "500+", label: "Satisfied Clients", icon: <FiUsers /> },
    { number: "15+", label: "Years Experience", icon: <FiAward /> },
    { number: "50+", label: "Global Partners", icon: <FiGlobe /> },
    { number: "24/7", label: "Support Available", icon: <FiClock /> }
  ];

  // Phase-6 CMS migration — Home About Preview is now fully CMS-driven with no static fallback.
  const aboutPreview = content?.home?.aboutPreview || null;
  const aboutTitle = toText(aboutPreview?.title);
  const aboutParagraphs = Array.isArray(aboutPreview?.paragraphs) ? aboutPreview.paragraphs : [];
  const aboutCompanyImage = aboutPreview?.companyImage;

  return (
    <div className="home-page">
      {/* 1. Hero Section - Welcoming */}
      <HeroSection />

      {/* 2. About Al Safa Global */}
      <section className="about-preview-section" ref={ref}>
        <div className="container">
          <div className="about-preview-content">
            <motion.div 
              className="about-text"
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <h2>
                <span data-cms-key="home.aboutPreview.title">
                  {aboutTitle}
                </span>
              </h2>
              {aboutParagraphs.slice(0, 3).map((p, i) => (
                <p key={i} data-cms-key={`home.aboutPreview.paragraphs.${i}`}>{toText(p)}</p>
              ))}
              <div className="about-features">
                <div className="feature-item">
                  <FiCheckCircle className="feature-icon" />
                  <span>End-to-End Procurement Solutions</span>
                </div>
                <div className="feature-item">
                  <FiCheckCircle className="feature-icon" />
                  <span>Global Sourcing & Supply</span>
                </div>
                <div className="feature-item">
                  <FiCheckCircle className="feature-icon" />
                  <span>Integrated Logistics Management</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="about-image"
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Company overview image above floating cards */}
              <div className="company-image-wrapper">
                <img 
                  data-cms-key="home.aboutPreview.companyImage"
                  data-cms-type="image"
                  src={aboutCompanyImage} 
                  alt="Al Safa Global Company Overview" 
                  className="company-overview-image"
                />
              </div>
              
              <div className="image-container">
                <div className={`floating-card card-1 ${cardsScrolled.card1 ? 'scrolled' : ''}`}>
                  <FiTrendingUp />
                  <span>Growth</span>
                </div>
                <div className={`floating-card card-2 ${cardsScrolled.card2 ? 'scrolled' : ''}`}>
                  <FiGlobe />
                  <span>Global</span>
                </div>
                <div className={`floating-card card-3 ${cardsScrolled.card3 ? 'scrolled' : ''}`}>
                  <FiAward />
                  <span>Quality</span>
                </div>
                <div className={`floating-card card-4 ${cardsScrolled.card4 ? 'scrolled' : ''}`}>
                  <FiPackage />
                  <span>Procurement</span>
                </div>
                <div className={`floating-card card-5 ${cardsScrolled.card5 ? 'scrolled' : ''}`}>
                  <FiLink />
                  <span>Supply Chain</span>
                </div>
              </div>
            </motion.div>

            {/* Learn More About Us Button - positioned after floating cards */}
            <motion.div 
              className="about-cta-button"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link to="/about" className="btn btn-primary">
                Learn More About Us
                <FiArrowRight />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Our Business Segments */}
      <section className="divisions-section">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 data-cms-key="home.sections.divisions.title">{toText(content?.home?.sections?.divisions?.title)}</h2>
            <p className="section-subtitle" data-cms-key="home.sections.divisions.subtitle">
              {toText(content?.home?.sections?.divisions?.subtitle)}
            </p>
          </motion.div>
          
          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }} contentEditable={false}>
              <button type="button" className="btn btn-secondary" onClick={handleAddDivision}>
                Add
              </button>
            </div>
          )}

          <div className="divisions-grid" data-cms-list="home.divisions">
            {divisionsToRender.map((division, index) => {
              const key = `home:division:${division.id}`;
              const disabled = isDisabled(key);
              const persistDisabled = !!division?._disabled;
              if ((disabled || persistDisabled) && !isEditMode) return null;
              return (
              <motion.div
                key={division.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                draggable={isEditMode}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => { if (isEditMode) e.preventDefault(); }}
                onDrop={() => handleDrop(index)}
                data-cms-item
                data-disabled={(disabled || persistDisabled) ? 'true' : 'false'}
              >
                <div style={{ position: 'relative', paddingTop: isEditMode ? 56 : 0, opacity: disabled ? 0.5 : 1 }}>
                  {isEditMode && (
                    <div
                      style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}
                      contentEditable={false}
                    >
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleRemoveDivision(division.id)}
                      >
                        Delete
                      </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginLeft: 8 }}
                          onClick={() => (disabled ? enableContent(key) : disableContent(key))}
                        >
                          {disabled ? 'Activate' : 'Disable'}
                        </button>
                    </div>
                  )}
                  {/* Hidden fields for CMS serialization */}
                  <span data-cms-field="id" style={{ display: 'none' }}>{division.id}</span>
                  <span data-cms-field="title" style={{ display: 'none' }}>{division.title}</span>
                  <span data-cms-field="description" style={{ display: 'none' }}>{division.description}</span>
                  <span data-cms-field="link" style={{ display: 'none' }}>{division.link}</span>
                  <span data-cms-field="icon" style={{ display: 'none' }}>{division.icon}</span>
                  <span data-cms-field="color" style={{ display: 'none' }}>{division.color}</span>
                  <DivisionCard {...division} />
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* 4. Why Choose Al Safa Global */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Live CMS data source */}
            <h2 data-cms-key="home.sections.features.title">{toText(content?.home?.sections?.features?.title)}</h2>
            <p className="section-subtitle" data-cms-key="home.sections.features.subtitle">
              {toText(content?.home?.sections?.features?.subtitle)}
            </p>
          </motion.div>

          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }} contentEditable={false}>
              <button type="button" className="btn btn-secondary" onClick={handleAddFeature}>
                Add
              </button>
            </div>
          )}

          <div className="features-grid" data-cms-list="home.features">
            {featuresToRender.map((feature, index) => {
              const key = `home:feature:${index}`;
              const disabled = isDisabled(key);
              const persistDisabled = !!feature?._disabled;
              if ((disabled || persistDisabled) && !isEditMode) return null;
              return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                data-cms-item
                data-disabled={(disabled || persistDisabled) ? 'true' : 'false'}
              >
                <div style={{ position: 'relative', paddingTop: isEditMode ? 56 : 0, opacity: disabled ? 0.5 : 1 }}>
                  {isEditMode && (
                    <div
                      style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}
                      contentEditable={false}
                    >
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        Delete
                      </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ marginLeft: 8 }}
                          onClick={() => (disabled ? enableContent(key) : disableContent(key))}
                        >
                          {disabled ? 'Activate' : 'Disable'}
                        </button>
                    </div>
                  )}
                  {/* Hidden fields for CMS serialization */}
                  <span data-cms-field="icon" style={{ display: 'none' }}>
                    {(content?.home?.features?.[index]?.icon)}
                  </span>
                  <span data-cms-field="title" style={{ display: 'none' }}>{feature.title}</span>
                  <span data-cms-field="description" style={{ display: 'none' }}>{feature.description}</span>
                  <FeatureCard {...feature} />
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* 5. Ready to Get Started - CTA Section */}
      <CtaSection />

      {/* 6. Trusted Brand Partners - Stats Section */}
      <StatsSection stats={stats} />

      {/* 7. Get in Touch - Testimonials Section */}
      <TestimonialSection />
      <ConfirmDialog
        open={confirmState.open}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Home; 