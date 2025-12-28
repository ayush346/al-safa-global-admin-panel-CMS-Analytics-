const express = require('express');
const { body, validationResult } = require('express-validator');
const Contact = require('../models/Contact');
const sendEmail = require('../utils/email');
const router = express.Router();

// Validation middleware
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject must be between 5 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
  body('division')
    .optional()
    .isIn([
      'Office & Construction',
      'Oil & Gas',
      'Industrial & Manufacturing',
      'Aviation & Marine',
      'Defence Sector',
      'General Inquiry'
    ])
    .withMessage('Invalid division selected')
];

// POST /api/contact - Submit contact form
router.post('/', validateContact, async (req, res) => {
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
      phone,
      company,
      subject,
      message,
      division = 'General Inquiry'
    } = req.body;

    // Create contact record
    const contact = new Contact({
      name,
      email,
      phone,
      company,
      subject,
      message,
      division,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await contact.save();

    // Send email notification
    const emailData = {
      to: process.env.EMAIL_FROM,
      subject: `New Contact Form Submission: ${subject}`,
      template: 'contact-notification',
      context: {
        name,
        email,
        phone: phone || 'Not provided',
        company: company || 'Not provided',
        subject,
        message,
        division,
        date: contact.formattedDate
      }
    };

    // Send email (non-blocking)
    sendEmail(emailData).catch(err => {
      console.error('Email sending failed:', err);
    });

    // Send confirmation email to user
    const userEmailData = {
      to: email,
      subject: 'Thank you for contacting Al Safa Global',
      template: 'contact-confirmation',
      context: {
        name,
        subject,
        message: 'We have received your inquiry and will get back to you within 24 hours.'
      }
    };

    sendEmail(userEmailData).catch(err => {
      console.error('User confirmation email failed:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        division: contact.division,
        submittedAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.'
    });
  }
});

// GET /api/contact - Get contact statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: {
            $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
          },
          read: {
            $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
          },
          replied: {
            $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] }
          }
        }
      }
    ]);

    const divisionStats = await Contact.aggregate([
      {
        $group: {
          _id: '$division',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, new: 0, read: 0, replied: 0 },
        divisions: divisionStats
      }
    });

  } catch (error) {
    console.error('Contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
});

module.exports = router; 