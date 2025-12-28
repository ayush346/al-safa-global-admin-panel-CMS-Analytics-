import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Quote.css';

const Quote = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    division: '',
    inquiryType: 'Request for Quotation',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

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
      const subject = `Quote Request - ${formData.division}`;
      
      // Create email body with all form details
      const emailBody = `
Dear Al Safa Global Team,

I would like to request a quotation through your website.

CONTACT DETAILS:
• Name: ${formData.name}
• Email: ${formData.email}
• Company: ${formData.company || 'Not provided'}
• Phone: ${formData.phone || 'Not provided'}

REQUEST DETAILS:
• Division of Interest: ${formData.division}
• Type of Request: ${formData.inquiryType}

REQUIREMENTS:
${formData.message}

---
This quote request was sent from the Al Safa Global website.
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
        inquiryType: 'Request for Quotation',
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
    <div className="quote-page">
      <div className="quote-container">
        <motion.div 
          className="quote-form-wrapper"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="quote-header">
            <h1 className="quote-title">
              Request a <span>Quote</span>
            </h1>
            <p className="quote-subtitle">
              Tell us about your requirements and we'll provide you with a competitive quotation.
            </p>
          </div>
          
          {submitStatus === 'success' && (
            <motion.div 
              className="alert alert-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3>Email Client Opened!</h3>
              <p>Your default email client should have opened with a pre-filled quote request. Please review and send the email to info@alsafaglobal.com</p>
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div 
              className="alert alert-error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3>Something went wrong</h3>
              <p>Please try again or contact us directly at info@alsafaglobal.com</p>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="quote-form">
            <div className="form-row">
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
            </div>
            
            <div className="form-row">
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
            </div>
            
            <div className="form-group">
              <select 
                name="division"
                value={formData.division}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Segment of Interest *</option>
                <option value="Office, Construction & Infrastructure">Office, Construction & Infrastructure</option>
                <option value="Oil & Gas">Oil & Gas</option>
                
                <option value="Industrial & Manufacturing">Industrial & Manufacturing</option>
                <option value="Aviation & Marine">Aviation, Marine & Shipping</option>
                <option value="Defence Sector">Defence Sector</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>
            
            <div className="form-group">
              <select 
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleInputChange}
                required
              >
                <option value="Request for Quotation">Request for Quotation</option>
                <option value="Bulk Order Quote">Bulk Order Quote</option>
                <option value="Custom Solution Quote">Custom Solution Quote</option>
                <option value="Partnership Quote">Partnership Quote</option>
                <option value="Service Quote">Service Quote</option>
              </select>
            </div>
            
            <div className="form-group">
              <textarea 
                name="message"
                placeholder="Please describe your requirements, specifications, quantities, and any other details for your quote request *" 
                rows="6" 
                value={formData.message}
                onChange={handleInputChange}
                required
              ></textarea>
            </div>
            
            <motion.button 
              type="submit" 
              className="btn btn-primary btn-large quote-submit-btn"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? 'Opening Email...' : 'Request Quote'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Quote;