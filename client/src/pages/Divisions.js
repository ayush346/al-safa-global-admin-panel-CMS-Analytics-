import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import './Divisions.css';
import { useEditMode } from '../context/EditModeContext';
import { useContent } from '../context/ContentContext';

const Divisions = () => {
  const { divisions: divisionsFromContent = [] } = useContent();
  const location = useLocation();
  const { isEditMode, isDisabled, disableContent, enableContent } = useEditMode();
  const [confirmState, setConfirmState] = useState({
    open: false,
    message: '',
    onConfirm: null,
  });

  const askConfirm = (message, onConfirm) => {
    setConfirmState({
      open: true,
      message,
      onConfirm,
    });
  };

  const handleConfirm = () => {
    if (typeof confirmState.onConfirm === 'function') {
      confirmState.onConfirm();
    }
    setConfirmState({ open: false, message: '', onConfirm: null });
  };

  const handleCancel = () => {
    setConfirmState({ open: false, message: '', onConfirm: null });
  };

  // Scroll to specific section based on URL hash or query parameter
  useEffect(() => {
    const scrollToSection = () => {
      // Helper function to scroll with header offset
      const scrollToElementWithOffset = (element) => {
        if (element) {
          setTimeout(() => {
            // Calculate responsive header height based on screen size
            const isMobile = window.innerWidth <= 768;
            const headerHeight = isMobile ? 90 : 100; // Slightly less for mobile, more for desktop
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }, 100);
        }
      };

      // Check for hash in URL (e.g., #office-construction)
      const hash = location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        scrollToElementWithOffset(element);
      }
      
      // Check for query parameter (e.g., ?section=office-construction)
      const urlParams = new URLSearchParams(location.search);
      const section = urlParams.get('section');
      if (section) {
        const element = document.getElementById(section);
        scrollToElementWithOffset(element);
      }
    };

    scrollToSection();
  }, [location]);

  const initialDivisions = Array.isArray(divisionsFromContent) ? divisionsFromContent : [];
  const [divisions, setDivisions] = useState(initialDivisions);

  const handleAddDivision = () => {
    setDivisions(prev => ([
      ...prev,
      {
        id: `new-${Date.now()}`,
        title: "New Segment",
        description: "Click here to edit the segment description.",
        items: [
          "Click here to add details for this segment"
        ]
      }
    ]));
  };

  const handleRemoveDivision = (id) => {
    setDivisions(prev => prev.filter(d => d.id !== id));
  };

  const handleAddDivisionItem = (divisionId) => {
    setDivisions(prev => prev.map(d => {
      if (d.id !== divisionId) return d;
      return {
        ...d,
        items: [...d.items, "New item - click to edit"]
      };
    }));
  };

  const handleRemoveDivisionItem = (divisionId, itemIndex) => {
    setDivisions(prev => prev.map(d => {
      if (d.id !== divisionId) return d;
      return {
        ...d,
        items: d.items.filter((_, i) => i !== itemIndex)
      };
    }));
  };

  return (
    <div className="divisions-page">
      {/* Hero Section */}
      <section className="divisions-hero">
        <div className="container">
          <motion.div 
            className="divisions-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="gradient-text">
              <span className="gold-text">Al Safa Global</span> Segments
            </h1>

            <p>
              We provide comprehensive procurement and supply chain solutions across multiple industries, 
              ensuring our clients receive the highest quality products and services tailored to their 
              specific sector requirements.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Divisions Content */}
      <section className="divisions-content">
        <div className="container">
          {isEditMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 0' }} contentEditable={false}>
              <button type="button" className="btn btn-secondary" onClick={handleAddDivision}>
                Add Segment
              </button>
            </div>
          )}

          {divisions.map((division, index) => {
            const sectionKey = `divisions:segment:${division.id}`;
            const sectionDisabled = isDisabled(sectionKey);
            if (sectionDisabled && !isEditMode) {
              return null;
            }
            return (
            <motion.div
              key={division.title}
              id={division.id}
              className="division-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              style={isEditMode ? { position: 'relative', paddingTop: 56, opacity: sectionDisabled ? 0.5 : 1 } : undefined}
            >
              {isEditMode && (
                <div
                  style={{ position: 'absolute', right: 16, marginTop: -8, zIndex: 5 }}
                  contentEditable={false}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      askConfirm(
                        'Are you sure you want to delete this segment?',
                        () => handleRemoveDivision(division.id)
                      )
                    }
                  >
                    Delete
                  </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ marginLeft: 8 }}
                      onClick={() => (sectionDisabled ? enableContent(sectionKey) : disableContent(sectionKey))}
                    >
                      {sectionDisabled ? 'Activate' : 'Disable'}
                    </button>
                </div>
              )}
              <div className="division-header">
                <h2>{division.title}</h2>
                <p className="division-description">{division.description}</p>
              </div>
              
              <div className="division-items-container">
                <h3>Our Products & Services Include:</h3>
                {isEditMode && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }} contentEditable={false}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleAddDivisionItem(division.id)}
                    >
                      Add Item
                    </button>
                  </div>
                )}
                <ul className="division-items">
                  {division.items.map((item, itemIndex) => {
                    const itemKey = `divisions:item:${division.id}:${itemIndex}`;
                    const itemDisabled = isDisabled(itemKey);
                    if (itemDisabled && !isEditMode) {
                      return null;
                    }
                    return (
                    <motion.li 
                      key={itemIndex}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: itemIndex * 0.1 }}
                      viewport={{ once: true }}
                      style={{ position: 'relative', paddingRight: isEditMode ? 160 : undefined, opacity: itemDisabled ? 0.5 : 1 }}
                    >
                      {isEditMode && (
                        <div
                          style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}
                          contentEditable={false}
                        >
                          <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                              askConfirm(
                                'Are you sure you want to delete this item?',
                                () => handleRemoveDivisionItem(division.id, itemIndex)
                              )
                            }
                          >
                            Delete
                          </button>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ marginLeft: 8 }}
                              onClick={() => (itemDisabled ? enableContent(itemKey) : disableContent(itemKey))}
                            >
                              {itemDisabled ? 'Activate' : 'Disable'}
                            </button>
                        </div>
                      )}
                      {item}
                    </motion.li>
                  )})}
                </ul>
              </div>
            </motion.div>
          )})}
        </div>
      </section>

      {/* Additional Information */}
      <section className="divisions-info">
        <div className="container">
          <motion.div 
            className="info-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Why Choose Us?</h2>
            <WhyChooseEditable askConfirm={askConfirm} />
          </motion.div>
        </div>
      </section>

      {/* Confirmation Dialog */}
      {confirmState.open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              background: '#fff',
              padding: '1rem 1.25rem',
              borderRadius: 8,
              width: 'min(420px, 92vw)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: 0, marginBottom: 8 }}>Confirm Deletion</h4>
            <p style={{ margin: 0 }}>{confirmState.message}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function WhyChooseEditable({ askConfirm }) {
  const { isEditMode, isDisabled, disableContent, enableContent } = useEditMode();
  const initialInfo = [
    {
      title: "Specialized Expertise",
      text: "Each division is staffed with industry experts who understand the unique requirements and challenges of their respective sectors."
    },
    {
      title: "Quality Assurance",
      text: "We maintain rigorous quality control standards and source only from reputable manufacturers and suppliers."
    },
    {
      title: "Comprehensive Solutions",
      text: "From initial procurement to final delivery, we provide end-to-end solutions tailored to your specific needs."
    },
    {
      title: "Global Network",
      text: "Our extensive network of suppliers and partners enables us to source the best products at competitive prices."
    }
  ];
  const [items, setItems] = useState(initialInfo);

  const handleAdd = () => {
    setItems(prev => ([
      ...prev,
      { title: "New Advantage", text: "Click here to describe the advantage." }
    ]));
  };

  const handleRemove = (indexToRemove) => {
    setItems(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  return (
    <>
      {isEditMode && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }} contentEditable={false}>
          <button type="button" className="btn btn-secondary" onClick={handleAdd}>
            Add
          </button>
        </div>
      )}
      <div className="info-grid">
        {items.map((info, idx) => {
          const infoKey = `divisions:why:${idx}`;
          const disabled = isDisabled(infoKey);
          if (disabled && !isEditMode) return null;
          return (
          <div
            key={`${info.title}-${idx}`}
            className="info-item"
            style={{ position: 'relative', paddingTop: isEditMode ? 56 : undefined, opacity: disabled ? 0.5 : 1 }}
          >
            {isEditMode && (
              <div
                style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }}
                contentEditable={false}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    askConfirm(
                      'Are you sure you want to delete this item?',
                      () => handleRemove(idx)
                    )
                  }
                >
                  Delete
                </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ marginLeft: 8 }}
                    onClick={() => (disabled ? enableContent(infoKey) : disableContent(infoKey))}
                  >
                    {disabled ? 'Activate' : 'Disable'}
                  </button>
              </div>
            )}
            <h3>{info.title}</h3>
            <p>{info.text}</p>
          </div>
        )})}
      </div>
    </>
  );
}

export default Divisions; 