const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  'contact-notification': (context) => ({
    subject: `New Contact Form Submission: ${context.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">New Contact Form Submission</h2>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #34495e; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${context.name}</p>
            <p><strong>Email:</strong> ${context.email}</p>
            <p><strong>Phone:</strong> ${context.phone}</p>
            <p><strong>Company:</strong> ${context.company}</p>
            <p><strong>Division:</strong> ${context.division}</p>
            <p><strong>Subject:</strong> ${context.subject}</p>
            <p><strong>Date:</strong> ${context.date}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #1976d2;">
            <h3 style="color: #34495e; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #2c3e50;">${context.message}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px;">This message was sent from the Al Safa Global website contact form.</p>
          </div>
        </div>
      </div>
    `
  }),

  'contact-confirmation': (context) => ({
    subject: 'Thank you for contacting Al Safa Global',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Al Safa Global</h1>
            <p style="color: #7f8c8d; font-size: 18px;">Your Trusted Partner in Procurement & Supply Chain Solutions</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60; margin-bottom: 20px;">
            <h2 style="color: #27ae60; margin-top: 0;">Thank you for contacting us!</h2>
            <p style="color: #2c3e50; line-height: 1.6;">Dear ${context.name},</p>
            <p style="color: #2c3e50; line-height: 1.6;">We have received your message regarding "${context.subject}" and appreciate you taking the time to reach out to us.</p>
            <p style="color: #2c3e50; line-height: 1.6;">Our team will review your inquiry and get back to you within 24 hours with a detailed response.</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #34495e; margin-top: 0;">What happens next?</h3>
            <ul style="color: #2c3e50; line-height: 1.6;">
              <li>Our team will review your inquiry within 24 hours</li>
              <li>We'll contact you to discuss your requirements in detail</li>
              <li>You'll receive a comprehensive proposal tailored to your needs</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 14px;">
              <strong>Al Safa Global General Trading FZ LLC</strong><br>
              Compass Building, Al Shohada Road<br>
              Al Hamra Industrial Zone-FZ, Ras Al Khaimah, UAE<br>
              Email: info@alsafaglobal.com
            </p>
          </div>
        </div>
      </div>
    `
  }),

  'business-inquiry': (context) => ({
    subject: `New Business Inquiry: ${context.projectType} - ${context.division}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">New Business Inquiry</h2>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #34495e; margin-top: 0;">Client Information</h3>
            <p><strong>Name:</strong> ${context.name}</p>
            <p><strong>Email:</strong> ${context.email}</p>
            <p><strong>Company:</strong> ${context.company}</p>
            <p><strong>Phone:</strong> ${context.phone}</p>
            <p><strong>Division:</strong> ${context.division}</p>
            <p><strong>Date:</strong> ${context.date}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #34495e; margin-top: 0;">Project Details</h3>
            <p><strong>Project Type:</strong> ${context.projectType}</p>
            <p><strong>Budget:</strong> ${context.budget}</p>
            <p><strong>Timeline:</strong> ${context.timeline}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Requirements</h3>
            <p style="line-height: 1.6; color: #856404;">${context.requirements}</p>
          </div>
          
          ${context.additionalInfo !== 'None provided' ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3 style="color: #34495e; margin-top: 0;">Additional Information</h3>
              <p style="line-height: 1.6; color: #2c3e50;">${context.additionalInfo}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }),

  'inquiry-confirmation': (context) => ({
    subject: 'Thank you for your business inquiry - Al Safa Global',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Al Safa Global</h1>
            <p style="color: #7f8c8d; font-size: 18px;">Your Trusted Partner in Procurement & Supply Chain Solutions</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60; margin-bottom: 20px;">
            <h2 style="color: #27ae60; margin-top: 0;">Business Inquiry Received</h2>
            <p style="color: #2c3e50; line-height: 1.6;">Dear ${context.name},</p>
            <p style="color: #2c3e50; line-height: 1.6;">Thank you for your business inquiry regarding "${context.projectType}" in our ${context.division} division.</p>
            <p style="color: #2c3e50; line-height: 1.6;">${context.message}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #34495e; margin-top: 0;">Next Steps</h3>
            <ul style="color: #2c3e50; line-height: 1.6;">
              <li>Our specialized team will review your requirements</li>
              <li>We'll research the best solutions and suppliers</li>
              <li>You'll receive a comprehensive proposal within 24-48 hours</li>
              <li>We'll schedule a detailed discussion to address any questions</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 14px;">
              <strong>Al Safa Global General Trading FZ LLC</strong><br>
              Compass Building, Al Shohada Road<br>
              Al Hamra Industrial Zone-FZ, Ras Al Khaimah, UAE<br>
              Email: info@alsafaglobal.com
            </p>
          </div>
        </div>
      </div>
    `
  }),

  'rfq-notification': (context) => ({
    subject: `New RFQ: ${context.division} - ${context.urgency.toUpperCase()} Priority`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #2c3e50; margin-bottom: 20px;">New Request for Quote</h2>
          
          <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #34495e; margin-top: 0;">Client Information</h3>
            <p><strong>Name:</strong> ${context.name}</p>
            <p><strong>Email:</strong> ${context.email}</p>
            <p><strong>Company:</strong> ${context.company}</p>
            <p><strong>Phone:</strong> ${context.phone}</p>
            <p><strong>Division:</strong> ${context.division}</p>
            <p><strong>Urgency:</strong> <span style="color: ${context.urgency === 'urgent' ? '#e74c3c' : context.urgency === 'high' ? '#f39c12' : '#1976d2'}; font-weight: bold;">${context.urgency.toUpperCase()}</span></p>
            <p><strong>Date:</strong> ${context.date}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #34495e; margin-top: 0;">Delivery Information</h3>
            <p><strong>Delivery Location:</strong> ${context.deliveryLocation}</p>
            <p><strong>Total Items:</strong> ${context.totalItems}</p>
          </div>
          
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Requested Items</h3>
            ${context.items.map((item, index) => `
              <div style="margin-bottom: 15px; padding: 10px; background-color: #ffffff; border-radius: 5px;">
                <p style="margin: 5px 0;"><strong>Item ${index + 1}:</strong> ${item.description}</p>
                <p style="margin: 5px 0;"><strong>Quantity:</strong> ${item.quantity}</p>
                ${item.specifications ? `<p style="margin: 5px 0;"><strong>Specifications:</strong> ${item.specifications}</p>` : ''}
              </div>
            `).join('')}
          </div>
          
          ${context.additionalNotes !== 'None provided' ? `
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-top: 20px;">
              <h3 style="color: #34495e; margin-top: 0;">Additional Notes</h3>
              <p style="line-height: 1.6; color: #2c3e50;">${context.additionalNotes}</p>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }),

  'rfq-confirmation': (context) => ({
    subject: 'RFQ Received - Al Safa Global',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Al Safa Global</h1>
            <p style="color: #7f8c8d; font-size: 18px;">Your Trusted Partner in Procurement & Supply Chain Solutions</p>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #27ae60; margin-bottom: 20px;">
            <h2 style="color: #27ae60; margin-top: 0;">RFQ Received Successfully</h2>
            <p style="color: #2c3e50; line-height: 1.6;">Dear ${context.name},</p>
            <p style="color: #2c3e50; line-height: 1.6;">We have received your Request for Quote for ${context.totalItems} item(s) in our ${context.division} division.</p>
            <p style="color: #2c3e50; line-height: 1.6;">${context.message}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #34495e; margin-top: 0;">What we'll do</h3>
            <ul style="color: #2c3e50; line-height: 1.6;">
              <li>Source competitive quotes from our global network</li>
              <li>Verify product authenticity and quality standards</li>
              <li>Prepare detailed pricing and delivery terms</li>
              <li>Provide you with a comprehensive quote within 24-48 hours</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 14px;">
              <strong>Al Safa Global General Trading FZ LLC</strong><br>
              Compass Building, Al Shohada Road<br>
              Al Hamra Industrial Zone-FZ, Ras Al Khaimah, UAE<br>
              Email: info@alsafaglobal.com
            </p>
          </div>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (emailData) => {
  try {
    const transporter = createTransporter();
    
    const { to, subject, template, context } = emailData;
    
    if (!emailTemplates[template]) {
      throw new Error(`Email template '${template}' not found`);
    }
    
    const templateData = emailTemplates[template](context);
    
    const mailOptions = {
      from: `"Al Safa Global" <${process.env.EMAIL_FROM}>`,
      to: to,
      subject: templateData.subject,
      html: templateData.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
    
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = sendEmail; 