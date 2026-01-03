import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  FiTarget, 
  FiEye, 
  FiUsers, 
  FiAward, 
  FiGlobe, 
  FiCheckCircle,
  FiClock,
  FiMail,
  FiMapPin
} from 'react-icons/fi';
import './About.css';
import { useEditMode } from '../context/EditModeContext';
import { ConfirmDialog, useConfirmState } from '../components/ConfirmDialog';
import { useContent } from '../context/ContentContext';
import { toText } from '../utils/cms';
import { useDraftList } from '../hooks/useDraftList';

const About = () => {
  const { about = {} } = useContent();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // State to track if brands have been animated in this page visit
  const [brandsAnimated, setBrandsAnimated] = React.useState(false);
  const { isEditMode, isDisabled, disableContent, enableContent } = useEditMode();
  const { confirmState, askConfirm, handleConfirm, handleCancel } = useConfirmState();

  // Add intersection observer for brand items
  const [brandsRef, brandsInView] = useInView({
    threshold: 0.2,
    triggerOnce: false
  });

  // Effect to handle brand animation trigger - only once per page visit
  useEffect(() => {
    if (brandsInView && !brandsAnimated) {
      setBrandsAnimated(true);
    }
  }, [brandsInView, brandsAnimated]);

  const initialValues = (Array.isArray(about.values) ? about.values.map(v => ({ title: v.title, description: v.description })) : []);
  const [values, setValues] = useDraftList('about.values', initialValues, (v) => ({ title: toText(v.title), description: toText(v.description) }), (v) => ({ title: toText(v.title), description: toText(v.description) }));

  const handleAddValue = () => {
    setValues(prev => ([
      ...prev,
      {
        icon: "➕",
        title: "New Value",
        description: "Click here to describe the core value."
      }
    ]));
  };

  const handleRemoveValue = (indexToRemove) => {
    askConfirm('Are you sure you want to delete this item?', () => {
      setValues(prev => prev.filter((_, i) => i !== indexToRemove));
    });
  };

  const initialAchievements = (Array.isArray(about.achievements)
    ? about.achievements.map(a => ({ ...a, icon: <FiAward /> }))
    : []);
  const [achievements, setAchievements] = React.useState(initialAchievements);

  const initialServices = Array.isArray(about.services) ? about.services : [];
  const [services, setServices] = useDraftList('about.services', initialServices, (s) => toText(s), (s) => toText(s));

  const initialSectorSolutions = Array.isArray(about.sectorSolutions) ? about.sectorSolutions : [];
  const [sectorSolutions, setSectorSolutions] = useDraftList('about.sectorSolutions', initialSectorSolutions, (s) => toText(s), (s) => toText(s));

  const initialValueAdded = [];
  const [valueAddedServices, setValueAddedServices] = React.useState(initialValueAdded);

  const initialBrands = Array.isArray(about.brands) ? about.brands : [];
  const [brands, setBrands] = useDraftList('about.brands', initialBrands, (b) => ({ name: toText(b.name), image: toText(b.image) }), (b) => ({ name: toText(b.name), image: toText(b.image) }));

  // Why Choose - editable list
  const initialWhy = Array.isArray(about.why) ? about.why : [];
  const [whyItems, setWhyItems] = useState(initialWhy);

  // Handlers for add/delete across sections
  const handleAddService = () => setServices(prev => [...prev, "New service - click to edit"]);
  const handleRemoveService = (index) => {
    askConfirm('Are you sure you want to delete this item?', () => {
      setServices(prev => prev.filter((_, i) => i !== index));
    });
  };

  const handleAddSectorSolution = () => setSectorSolutions(prev => [...prev, "New solution - click to edit"]);
  const handleRemoveSectorSolution = (index) => {
    askConfirm('Are you sure you want to delete this item?', () => {
      setSectorSolutions(prev => prev.filter((_, i) => i !== index));
    });
  };

  const handleAddValueAdded = () => setValueAddedServices(prev => [...prev, "New value-added service - click to edit"]);
  const handleRemoveValueAdded = (index) => {
    askConfirm('Are you sure you want to delete this item?', () => {
      setValueAddedServices(prev => prev.filter((_, i) => i !== index));
    });
  };

  const handleAddBrand = () => setBrands(prev => [...prev, { name: "New Brand", image: process.env.PUBLIC_URL + "/images/logo.png" }]);
  const handleRemoveBrand = (index) => {
    askConfirm('Are you sure you want to delete this brand?', () => {
      setBrands(prev => prev.filter((_, i) => i !== index));
    });
  };

  const handleAddAchievement = () => setAchievements(prev => [...prev, { number: "New", label: "Achievement", icon: <FiAward /> }]);
  const handleRemoveAchievement = (index) => {
    askConfirm('Are you sure you want to delete this item?', () => {
      setAchievements(prev => prev.filter((_, i) => i !== index));
    });
  };

  const handleAddWhy = () => setWhyItems(prev => [...prev, { title: "New Reason", text: "Describe the reason here." }]);
  const handleRemoveWhy = (index) => {
    askConfirm('Are you sure you want to delete this item?', () => {
      setWhyItems(prev => prev.filter((_, i) => i !== index));
    });
  };

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div 
            className="about-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="gradient-text" data-cms-key="about.heroTitle">{about?.heroTitle || <>About <span className="gold-text">Al Safa Global</span></>}</h1>
            {!!about?.heroSubtitle && (
              <p className="hero-subtitle" data-cms-key="about.heroSubtitle">
                {about.heroSubtitle}
              </p>
            )}
            <p className="hero-description" data-cms-key="about.introParagraph">
              {about?.introParagraph || 'Al Safa Global General Trading FZ LLC is a UAE-based company specializing in comprehensive procurement and supply chain solutions.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="vision-mission">
        <div className="container">
          <div className="vision-mission-grid">
            <motion.div 
              className="vision-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <FiEye />
              </div>
              <h3>Our Vision</h3>
              <p data-cms-key="about.vision">
                {about?.vision || 'To be a globally trusted procurement partner...'}
              </p>
            </motion.div>

            <motion.div 
              className="mission-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="card-icon">
                <FiTarget />
              </div>
              <h3>Our Mission</h3>
              <p data-cms-key="about.mission">
                {about?.mission || 'To provide reliable, cost-effective sourcing and supply solutions...'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="core-values">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 data-cms-key="about.sectionTitles.coreValues">{about?.sectionTitles?.coreValues || ''}</h2>
            <p className="section-subtitle">
              The principles that guide our business and relationships
            </p>
          </motion.div>

          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }} contentEditable={false}>
              <button type="button" className="btn btn-secondary" onClick={handleAddValue}>
                Add
              </button>
            </div>
          )}

          <div className="values-grid" data-cms-list="about.values">
            {values.map((value, index) => {
              const key = `about:value:${index}`;
              const disabled = isDisabled(key);
              if (disabled && !isEditMode) return null;
              return (
              <motion.div
                key={value.title}
                className="value-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                data-cms-item
                data-disabled={(disabled || value?._disabled) ? 'true' : 'false'}
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
                        onClick={() => handleRemoveValue(index)}
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
                  <span data-cms-field="title" style={{ display: 'none' }}>{value.title}</span>
                  <span data-cms-field="description" style={{ display: 'none' }}>{value.description}</span>
                  <div className="value-icon">
                    {value.icon}
                  </div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose-us" ref={ref}>
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 data-cms-key="about.sectionTitles.whyChooseUs">{about?.sectionTitles?.whyChooseUs || ''}</h2>
            <p className="section-subtitle">
              We combine industry expertise with innovative solutions to deliver exceptional value
            </p>
          </motion.div>

          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }} contentEditable={false}>
              <button type="button" className="btn btn-secondary" onClick={handleAddWhy}>
                Add
              </button>
            </div>
          )}
          <div className="features-grid" data-cms-list="about.why">
            {whyItems.map((item, idx) => {
              const key = `about:why:${idx}`;
              const disabled = isDisabled(key);
              if (disabled && !isEditMode) return null;
              const persistDisabled = !!item?._disabled;
              return (
              <motion.div 
                key={`${item.title}-${idx}`}
                className="feature-item"
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                data-cms-item
                data-disabled={(disabled || persistDisabled) ? 'true' : 'false'}
              >
                <div style={{ position: 'relative', paddingTop: isEditMode ? 56 : 0, opacity: disabled ? 0.5 : 1 }}>
                  {isEditMode && (
                    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }} contentEditable={false}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleRemoveWhy(idx)}
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
                  <span data-cms-field="title" style={{ display: 'none' }}>{item.title}</span>
                  <span data-cms-field="text" style={{ display: 'none' }}>{item.text}</span>
                  <FiCheckCircle className="feature-icon" />
                  <div className="feature-content">
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="core-services">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 data-cms-key="about.sectionTitles.coreServices">{about?.sectionTitles?.coreServices || ''}</h2>
            <p className="section-subtitle">
              Comprehensive solutions tailored to your business needs
            </p>
          </motion.div>

          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }} contentEditable={false}>
              <button type="button" className="btn btn-secondary" onClick={handleAddService}>
                Add
              </button>
            </div>
          )}
          <div className="services-grid" data-cms-list="about.services">
            {services.map((service, index) => {
              const key = `about:service:${index}`;
              const disabled = isDisabled(key);
              if (disabled && !isEditMode) return null;
              const persistDisabled = typeof service === 'object' && service?._disabled;
              return (
              <motion.div
                key={service}
                className="service-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ position: 'relative', paddingTop: isEditMode ? 56 : 0, opacity: disabled ? 0.5 : 1 }}
                data-cms-item
                data-disabled={(disabled || persistDisabled) ? 'true' : 'false'}
              >
                {isEditMode && (
                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }} contentEditable={false}>
                    <button type="button" className="btn btn-secondary" onClick={() => handleRemoveService(index)}>
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
                <span data-cms-field="text" style={{ display: 'none' }}>{toText(service)}</span>
                <FiCheckCircle className="service-icon" />
                <span>{toText(service)}</span>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* Sector-Specific Solutions */}
      <section className="sector-solutions">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 data-cms-key="about.sectionTitles.sectorSolutions">{about?.sectionTitles?.sectorSolutions || ''}</h2>
            <p className="section-subtitle">
              Specialized procurement services for different industries
            </p>
          </motion.div>

          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }} contentEditable={false}>
              <button type="button" className="btn btn-secondary" onClick={handleAddSectorSolution}>
                Add
              </button>
            </div>
          )}
          <div className="solutions-grid" data-cms-list="about.sectorSolutions">
            {sectorSolutions.map((solution, index) => {
              const key = `about:sector:${index}`;
              const disabled = isDisabled(key);
              if (disabled && !isEditMode) return null;
              const persistDisabled = typeof solution === 'object' && solution?._disabled;
              return (
              <motion.div
                key={solution}
                className="solution-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ position: 'relative', paddingTop: isEditMode ? 56 : 0, opacity: disabled ? 0.5 : 1 }}
                data-cms-item
                data-disabled={(disabled || persistDisabled) ? 'true' : 'false'}
              >
                {isEditMode && (
                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }} contentEditable={false}>
                    <button type="button" className="btn btn-secondary" onClick={() => handleRemoveSectorSolution(index)}>
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
                <span data-cms-field="text" style={{ display: 'none' }}>{toText(solution)}</span>
                <FiCheckCircle className="solution-icon" />
                <span>{toText(solution)}</span>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* Value-Added Services */}
      <section className="value-added-services">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 data-cms-key="about.sectionTitles.valueAddedServices">{about?.sectionTitles?.valueAddedServices || ''}</h2>
            <p className="section-subtitle">
              Additional benefits that set us apart from the competition
            </p>
          </motion.div>

          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }} contentEditable={false}>
              <button type="button" className="btn btn-secondary" onClick={handleAddValueAdded}>
                Add
              </button>
            </div>
          )}
          <div className="value-services-grid">
            {valueAddedServices.map((service, index) => {
              const key = `about:valueAdded:${index}`;
              const disabled = isDisabled(key);
              if (disabled && !isEditMode) return null;
              return (
              <motion.div
                key={service}
                className="value-service-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ position: 'relative', paddingTop: isEditMode ? 56 : 0, opacity: disabled ? 0.5 : 1 }}
              >
                {isEditMode && (
                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }} contentEditable={false}>
                    <button type="button" className="btn btn-secondary" onClick={() => handleRemoveValueAdded(index)}>
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
                <FiCheckCircle className="value-service-icon" />
                <span>{service}</span>
              </motion.div>
            )})}
          </div>
        </div>
      </section>

      {/* Trusted Brands */}
      <section className="trusted-brands">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 data-cms-key="about.sectionTitles.trustedBrands">{about?.sectionTitles?.trustedBrands || ''}</h2>
            <p className="section-subtitle">
              We source and supply materials from a wide network of reputed international brands, 
              ensuring genuine quality and trusted performance
            </p>
          </motion.div>

          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }} contentEditable={false}>
              <button type="button" className="btn btn-secondary" onClick={handleAddBrand}>
                Add
              </button>
            </div>
          )}
          <motion.div 
            className="brands-grid"
            ref={brandsRef}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            data-cms-list="about.brands"
          >
            {brands.map((brand, index) => {
              const key = `about:brand:${index}`;
              const disabled = isDisabled(key);
              if (disabled && !isEditMode) return null;
              const persistDisabled = !!brand?._disabled;
              return (
              <motion.div
                key={brand.name}
                className={`brand-item ${brandsAnimated ? 'in-view' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={brandsAnimated ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                style={{ position: 'relative', paddingTop: isEditMode ? 56 : 0, opacity: disabled ? 0.5 : 1 }}
                data-disabled={(disabled || persistDisabled) ? 'true' : 'false'}
              >
                {isEditMode && (
                  <div style={{ position: 'absolute', top: 4, right: 4, zIndex: 5 }} contentEditable={false}>
                    <button type="button" className="btn btn-secondary" onClick={() => handleRemoveBrand(index)}>
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
                <span data-cms-field="name" style={{ display: 'none' }}>{brand.name}</span>
                <span data-cms-field="image" style={{ display: 'none' }}>{brand.image}</span>
                <img 
                  src={brand.image} 
                  alt={brand.name}
                  onLoad={() => console.log(`${brand.name} logo loaded successfully`)}
                  onError={(e) => {
                    console.error(`Error loading ${brand.name} logo:`, e);
                    console.error('Attempted URL:', brand.image);
                  }}
                />
              </motion.div>
            )})}
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="contact-info-section">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Get In Touch</h2>
            <p className="section-subtitle">
              We would love to hear from you. For all inquiries, business proposals, 
              or partnership opportunities, please reach out to us.
            </p>
          </motion.div>

          <motion.div 
            className="contact-details"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="contact-item">
              <FiMail className="contact-icon" />
              <div>
                <h4>Email</h4>
                <p>
                  <a href="mailto:info@alsafaglobal.com" style={{ color: 'inherit', textDecoration: 'underline', wordBreak: 'break-all' }}>
                    info@alsafaglobal.com
                  </a>
                </p>
              </div>
            </div>
            
            <div className="contact-item">
              <FiMapPin className="contact-icon" />
              <div>
                <h4>Address</h4>
                <p>
                  AL SAFA GLOBAL GENERAL TRADING FZ LLC<br />
                  FDBC3472<br />
                  Compass Building, Al Shohada Road<br />
                  Al Hamra Industrial Zone-FZ<br />
                  P.O. Box 10055<br />
                  Ras Al Khaimah, United Arab Emirates<br />
                  <a href="tel:0097143741969" style={{ color: 'inherit', textDecoration: 'underline' }}>00971 4 3741 969</a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Achievements */}
      <section className="achievements-section">
        <div className="container">
          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }} contentEditable={false}>
              <button type="button" className="btn btn-secondary" onClick={handleAddAchievement}>
                Add
              </button>
            </div>
          )}
          <div className="achievements-grid">
            {achievements.map((achievement, index) => {
              const key = `about:achievement:${index}`;
              const disabled = isDisabled(key);
              if (disabled && !isEditMode) return null;
              return (
              <motion.div
                key={achievement.label}
                className="achievement-card"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{ position: 'relative', paddingTop: isEditMode ? 56 : 0, opacity: disabled ? 0.5 : 1 }}
              >
                {isEditMode && (
                  <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }} contentEditable={false}>
                    <button type="button" className="btn btn-secondary" onClick={() => handleRemoveAchievement(index)}>
                      Delete
                    </button>
                  </div>
                )}
                <div className="achievement-icon">
                  {achievement.icon}
                </div>
                <div className="achievement-number">{achievement.number}</div>
                <div className="achievement-label">{achievement.label}</div>
              </motion.div>
            )})}
          </div>
        </div>
      </section>
      <ConfirmDialog
        open={confirmState.open}
        message={confirmState.message}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default About; 