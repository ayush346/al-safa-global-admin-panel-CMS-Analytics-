const express = require('express');
const { body, validationResult } = require('express-validator');
const sendEmail = require('../utils/email');
const router = express.Router();

// Validation middleware for business inquiry
const validateInquiry = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Phone number must be between 5 and 20 characters'),
  body('division')
    .isIn([
      'Office & Construction',
      'Oil & Gas',
      'Industrial & Manufacturing',
      'Aviation & Marine',
      'Defence Sector'
    ])
    .withMessage('Please select a valid division'),
  body('projectType')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Project type must be between 5 and 200 characters'),
  body('budget')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Budget information cannot exceed 100 characters'),
  body('timeline')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Timeline cannot exceed 100 characters'),
  body('requirements')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Requirements must be between 10 and 2000 characters'),
  body('additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Additional information cannot exceed 1000 characters')
];

// POST /api/inquiry - Submit business inquiry
router.post('/', validateInquiry, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      company,
      phone,
      division,
      projectType,
      budget,
      timeline,
      requirements,
      additionalInfo
    } = req.body;

    // Send inquiry notification to company
    const inquiryEmailData = {
      to: process.env.EMAIL_FROM,
      subject: `New Business Inquiry: ${projectType} - ${division}`,
      template: 'business-inquiry',
      context: {
        name,
        email,
        company,
        phone,
        division,
        projectType,
        budget: budget || 'Not specified',
        timeline: timeline || 'Not specified',
        requirements,
        additionalInfo: additionalInfo || 'None provided',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    };

    // Send email (non-blocking)
    await sendEmail(inquiryEmailData);

    // Send confirmation email to client
    const confirmationEmailData = {
      to: email,
      subject: 'Thank you for your business inquiry - Al Safa Global',
      template: 'inquiry-confirmation',
      context: {
        name,
        company,
        division,
        projectType,
        message: 'We have received your business inquiry and our team will review it carefully. We will contact you within 24-48 hours to discuss your requirements in detail.'
      }
    };

    await sendEmail(confirmationEmailData);

    res.status(201).json({
      success: true,
      message: 'Thank you for your business inquiry. We will contact you within 24-48 hours!',
      data: {
        name,
        company,
        division,
        projectType,
        submittedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Business inquiry submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit business inquiry. Please try again later.'
    });
  }
});

// POST /api/inquiry/rfq - Submit Request for Quote
router.post('/rfq', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .isLength({ min: 5, max: 20 })
    .withMessage('Phone number must be between 5 and 20 characters'),
  body('division')
    .isIn([
      'Office & Construction',
      'Oil & Gas',
      'Industrial & Manufacturing',
      'Aviation & Marine',
      'Defence Sector'
    ])
    .withMessage('Please select a valid division'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.description')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Item description must be between 5 and 500 characters'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('items.*.specifications')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Specifications cannot exceed 1000 characters'),
  body('deliveryLocation')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Delivery location must be between 5 and 200 characters'),
  body('urgency')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Please select a valid urgency level'),
  body('additionalNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Additional notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      company,
      phone,
      division,
      items,
      deliveryLocation,
      urgency,
      additionalNotes
    } = req.body;

    // Send RFQ notification to company
    const rfqEmailData = {
      to: process.env.EMAIL_FROM,
      subject: `New RFQ: ${division} - ${urgency.toUpperCase()} Priority`,
      template: 'rfq-notification',
      context: {
        name,
        email,
        company,
        phone,
        division,
        items,
        deliveryLocation,
        urgency,
        additionalNotes: additionalNotes || 'None provided',
        totalItems: items.length,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    };

    await sendEmail(rfqEmailData);

    // Send confirmation email to client
    const confirmationEmailData = {
      to: email,
      subject: 'RFQ Received - Al Safa Global',
      template: 'rfq-confirmation',
      context: {
        name,
        company,
        division,
        totalItems: items.length,
        urgency,
        message: 'We have received your Request for Quote and will provide you with competitive pricing within 24-48 hours.'
      }
    };

    await sendEmail(confirmationEmailData);

    res.status(201).json({
      success: true,
      message: 'Your RFQ has been submitted successfully. We will provide you with a quote within 24-48 hours!',
      data: {
        name,
        company,
        division,
        totalItems: items.length,
        urgency,
        submittedAt: new Date()
      }
    });

  } catch (error) {
    console.error('RFQ submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit RFQ. Please try again later.'
    });
  }
});

module.exports = router; 