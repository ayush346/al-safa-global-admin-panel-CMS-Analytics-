import React from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone, FiGlobe, FiClock, FiUsers } from 'react-icons/fi';
import './Contact.css';
import { useEditMode } from '../context/EditModeContext';
import { ConfirmDialog, useConfirmState } from '../components/ConfirmDialog';
import { useContent } from '../context/ContentContext';
import { toText } from '../utils/cms';
import { useDraftList } from '../hooks/useDraftList';

const Contact = () => {
  const { contact = {}, forms = {} } = useContent();
  const { isEditMode, isDisabled, disableContent, enableContent } = useEditMode();
  const { confirmState, askConfirm, handleConfirm, handleCancel } = useConfirmState();
  // Phase-14 CMS migration — Contact Page is now fully CMS-driven with no static fallback.
  const initialBenefits = Array.isArray(contact.benefits) ? contact.benefits : [];
  const [benefits, setBenefits] = useDraftList('contact.benefits', initialBenefits, (b) => ({ title: toText(b.title), text: toText(b.text) }), (b) => ({ title: toText(b.title), text: toText(b.text) }));
  const handleAddBenefit = () => {
    setBenefits(prev => [...prev, { title: "New Benefit", text: "Click here to describe the benefit." }]);
  };
  const handleRemoveBenefit = (indexToRemove) => {
    askConfirm('Are you sure you want to delete this item?', () => {
      setBenefits(prev => prev.filter((_, i) => i !== indexToRemove));
    });
  };
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    division: '',
    inquiryType: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Create email subject
      const subject = `${formData.inquiryType} - ${formData.division}`;
      
      // Create email body with all form details
      const emailBody = `
Dear Al Safa Global Team,

I would like to submit an inquiry through your website contact form.

CONTACT DETAILS:
• Name: ${formData.name}
• Email: ${formData.email}
• Company: ${formData.company || 'Not provided'}
• Phone: ${formData.phone || 'Not provided'}

INQUIRY DETAILS:
• Division of Interest: ${formData.division}
• Type of Inquiry: ${formData.inquiryType}

MESSAGE:
${formData.message}

---
This message was sent from the Al Safa Global website contact form.
Submitted on: ${new Date().toLocaleString()}
      `.trim();

      // Create mailto URL
      const mailtoUrl = `mailto:info@alsafaglobal.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

      // Open default email client
      window.open(mailtoUrl, '_blank');

      // Show success message
      setSubmitStatus('success');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        division: '',
        inquiryType: '',
        message: ''
      });

    } catch (error) {
      setSubmitStatus('error');
      console.error('Error opening email client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <motion.div 
            className="contact-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
              {/* Phase-14 CMS migration — Contact Page is now fully CMS-driven with no static fallback. */}
              <h1 className="gradient-text" data-cms-key="contact.heroTitle">
              {toText(contact?.heroTitle)}
            </h1>
              <p className="hero-subtitle" data-cms-key="contact.heroSubtitle">
              {toText(contact?.heroSubtitle)}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            <motion.div 
              className="contact-info"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="contact-heading">Get In Touch</h2>
              <p data-cms-key="contact.description">
                {toText(contact?.description)}
              </p>
              
              <div className="contact-details">
                <div className="contact-item">
                  <FiMail className="contact-icon" />
                  <div>
                    <h4>Email</h4>
                    <p>
                      <a href={`mailto:${toText(contact?.email) || ''}`} className="contact-link" data-cms-key="contact.email">
                        {toText(contact?.email)}
                      </a>
                    </p>
                    <p>For business inquiries and partnerships</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <FiPhone className="contact-icon" />
                  <div>
                    <h4>Phone</h4>
                    <p>
                      <a href={`tel:${(toText(contact?.phone) || '').replace(/\\s/g, '')}`} className="contact-link" data-cms-key="contact.phone">
                        {toText(contact?.phone)}
                      </a>
                    </p>
                    <p>Available during business hours</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <FiMapPin className="contact-icon" />
                  <div>
                    <h4>Head Office Address</h4>
                    <p>
                      <span data-cms-key="contact.addressLines" style={{ display: 'none' }} />
                      {(contact?.addressLines || []).map((line, i) => (<React.Fragment key={i}>{toText(line)}<br /></React.Fragment>))}
                      <a href={`tel:${(toText(contact?.phone) || '').replace(/\\s/g, '')}`} style={{ color: 'inherit', textDecoration: 'underline' }}>{toText(contact?.phone)}</a>
                    </p>
                  </div>
                </div>

                <div className="contact-item">
                  <FiClock className="contact-icon" />
                  <div>
                    <h4>Business Hours</h4>
                    <div data-cms-list="contact.businessHours">
                      {(contact?.businessHours || []).map((h, i) => (
                        <p key={i} data-cms-item><span data-cms-field="text" style={{ display: 'none' }}>{toText(h)}</span>{toText(h)}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="contact-item">
                  <FiGlobe className="contact-icon" />
                  <div>
                    <h4>Service Areas</h4>
                    <div data-cms-list="contact.serviceAreas">
                      {(contact?.serviceAreas || []).map((s, i) => (<p key={i} data-cms-item><span data-cms-field="text" style={{ display: 'none' }}>{toText(s)}</span>{toText(s)}</p>))}
                    </div>
                  </div>
                </div>

                <div className="contact-item">
                  <FiUsers className="contact-icon" />
                  <div>
                    <h4>Partnership Opportunities</h4>
                    <p>{contact?.partnershipText || 'We welcome collaboration with suppliers, manufacturers, and business partners worldwide'}</p>
                    <p>Contact us to discuss potential partnerships</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="contact-form"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h2>Send us a Message</h2>
              <p>Fill out the form below and click "Send Message" to open your email client with a pre-filled message.</p>
              
              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  <h3>Email Client Opened!</h3>
                  <p>Your default email client should have opened with a pre-filled message. Please review and send the email to info@alsafaglobal.com</p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="alert alert-error">
                  <h3>Something went wrong</h3>
                  <p>Please try again or contact us directly at info@alsafaglobal.com</p>
                </div>
              )}
              
              {isEditMode ? (
                <div className="editable-form" contentEditable suppressContentEditableWarning>
                  <div className="form-group">
                    <div className="form-mock">Your Name *</div>
                  </div>
                  <div className="form-group">
                    <div className="form-mock">Your Email *</div>
                  </div>
                  <div className="form-group">
                    <div className="form-mock">Company Name</div>
                  </div>
                  <div className="form-group">
                    <div className="form-mock">Phone Number</div>
                  </div>
                  <div className="form-group">
                    <div className="form-mock">Select Segment of Interest *</div>
                    <ul className="form-mock-list">
                      <li>Office, Construction & Infrastructure</li>
                      <li>Oil & Gas</li>
                      <li>Industrial & Manufacturing</li>
                      <li>Aviation, Marine & Shipping</li>
                      <li>Defence Sector</li>
                      <li>General Inquiry</li>
                    </ul>
                  </div>
                  <div className="form-group">
                    <div className="form-mock">Type of Inquiry *</div>
                    <ul className="form-mock-list">
                      <li>Procurement Services</li>
                      <li>Supply Chain Solutions</li>
                      <li>Partnership Opportunity</li>
                      <li>Request for Quotation</li>
                      <li>General Inquiry</li>
                    </ul>
                  </div>
                  <div className="form-group">
                    <div className="form-mock form-mock-textarea">
                      Please describe your requirements or inquiry in detail *
                    </div>
                  </div>
                  <div className="form-mock-button">Send Message</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Your Name *" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Your Email *" 
                      value={formData.email}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="text" 
                      name="company"
                      placeholder="Company Name" 
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="Phone Number" 
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <select 
                      name="division"
                      value={formData.division}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Segment of Interest *</option>
                      {(forms?.divisionsOptions || []).map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div className="form-group">
                    <select 
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Type of Inquiry *</option>
                      {(forms?.inquiryTypes || []).map((o) => (<option key={o} value={o}>{o}</option>))}
                    </select>
                  </div>
                  <div className="form-group">
                    <textarea 
                      name="message"
                      placeholder="Please describe your requirements or inquiry in detail *" 
                      rows="6" 
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Opening Email...' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="contact-additional">
        <div className="container">
          <motion.div 
            className="additional-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Why Choose Al Safa Global?</h2>
            {isEditMode && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }} contentEditable={false}>
                <button type="button" className="btn btn-secondary" onClick={handleAddBenefit}>
                  Add
                </button>
              </div>
            )}
            <div className="benefits-grid" data-cms-list="contact.benefits">
              {benefits.map((b, idx) => {
                const key = `contact:benefit:${idx}`;
                const disabled = isDisabled(key);
                if (disabled && !isEditMode) return null;
                return (
                <div
                  key={`${b.title}-${idx}`}
                  className="benefit-item"
                  style={{ position: 'relative', paddingTop: isEditMode ? 56 : 0, opacity: disabled ? 0.5 : 1 }}
                  data-cms-item
                  data-disabled={(disabled || !!b?._disabled) ? 'true' : 'false'}
                >
                  {isEditMode && (
                    <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5 }} contentEditable={false}>
                      <button type="button" className="btn btn-secondary" onClick={() => handleRemoveBenefit(idx)}>
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
                  <span data-cms-field="title" style={{ display: 'none' }}>{b.title}</span>
                  <span data-cms-field="text" style={{ display: 'none' }}>{b.text}</span>
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </div>
              )})}
            </div>
          </motion.div>
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

export default Contact; 