const Contact = require('../models/Contact');
const { sendEmail } = require('../utils/email');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
   try {
      const {
         name,
         email,
         phone,
         subject,
         message,
         inquiryType,
         preferredContactMethod
      } = req.body;

      // Create contact record
      const contact = await Contact.create({
         name,
         email,
         phone,
         subject,
         message,
         inquiryType,
         preferredContactMethod,
         ipAddress: req.ip,
         userAgent: req.get('User-Agent')
      });

      // Send notification email to admin
      try {
         await sendEmail({
            email: process.env.ADMIN_EMAIL || 'admin@mowanaspa.co.za',
            subject: `New Contact Form Submission: ${subject}`,
            message: `
New contact form submission received:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Subject: ${subject}
Message: ${message}
Inquiry Type: ${inquiryType}
Preferred Contact Method: ${preferredContactMethod}
Submitted: ${new Date().toLocaleString('en-ZA')}
        `
         });
      } catch (emailError) {
         console.error('Failed to send notification email:', emailError);
         // Don't fail the request if email fails
      }

      // Send auto-reply to customer
      try {
         await sendEmail({
            email: email,
            subject: 'Thank you for contacting Mowana Spa',
            message: `
Dear ${name},

Thank you for contacting Mowana Spa. We have received your message and will get back to you within 24 hours.

Your inquiry details:
Subject: ${subject}
Message: ${message}

If you have any urgent questions, please call us at +27 (0)11 840 6780.

Best regards,
The Mowana Spa Team
        `
         });
      } catch (emailError) {
         console.error('Failed to send auto-reply email:', emailError);
         // Don't fail the request if email fails
      }

      res.status(201).json({
         success: true,
         message: 'Thank you for your message. We will get back to you soon.',
         contactId: contact._id
      });
   } catch (error) {
      console.error('Contact form submission error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error. Please try again later.'
      });
   }
};

// @desc    Get all contact submissions (Admin)
// @route   GET /api/contact
// @access  Private/Admin
const getAllContacts = async (req, res) => {
   try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const priority = req.query.priority;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;

      const contacts = await Contact.find(filter)
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit)
         .populate('assignedTo', 'firstName lastName email');

      const total = await Contact.countDocuments(filter);

      res.status(200).json({
         success: true,
         count: contacts.length,
         total,
         page,
         pages: Math.ceil(total / limit),
         data: contacts
      });
   } catch (error) {
      console.error('Get contacts error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

// @desc    Get single contact submission
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContact = async (req, res) => {
   try {
      const contact = await Contact.findById(req.params.id)
         .populate('assignedTo', 'firstName lastName email')
         .populate('response.respondedBy', 'firstName lastName email');

      if (!contact) {
         return res.status(404).json({
            success: false,
            message: 'Contact submission not found'
         });
      }

      res.status(200).json({
         success: true,
         data: contact
      });
   } catch (error) {
      console.error('Get contact error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
const updateContactStatus = async (req, res) => {
   try {
      const { status, priority, assignedTo, tags } = req.body;

      const contact = await Contact.findById(req.params.id);
      if (!contact) {
         return res.status(404).json({
            success: false,
            message: 'Contact submission not found'
         });
      }

      if (status) contact.status = status;
      if (priority) contact.priority = priority;
      if (assignedTo) contact.assignedTo = assignedTo;
      if (tags) contact.tags = tags;

      await contact.save();

      res.status(200).json({
         success: true,
         message: 'Contact status updated successfully',
         data: contact
      });
   } catch (error) {
      console.error('Update contact status error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

// @desc    Respond to contact
// @route   POST /api/contact/:id/respond
// @access  Private/Admin
const respondToContact = async (req, res) => {
   try {
      const { responseMessage } = req.body;

      const contact = await Contact.findById(req.params.id);
      if (!contact) {
         return res.status(404).json({
            success: false,
            message: 'Contact submission not found'
         });
      }

      // Update contact with response
      contact.status = 'resolved';
      contact.response = {
         message: responseMessage,
         respondedBy: req.user.id,
         respondedAt: new Date()
      };

      await contact.save();

      // Send response email to customer
      try {
         await sendEmail({
            email: contact.email,
            subject: `Re: ${contact.subject}`,
            message: `
Dear ${contact.name},

Thank you for contacting Mowana Spa. Here is our response to your inquiry:

${responseMessage}

If you have any further questions, please don't hesitate to contact us.

Best regards,
The Mowana Spa Team
        `
         });
      } catch (emailError) {
         console.error('Failed to send response email:', emailError);
         // Don't fail the request if email fails
      }

      res.status(200).json({
         success: true,
         message: 'Response sent successfully',
         data: contact
      });
   } catch (error) {
      console.error('Respond to contact error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private/Admin
const getContactStats = async (req, res) => {
   try {
      const stats = await Contact.aggregate([
         {
            $group: {
               _id: '$status',
               count: { $sum: 1 }
            }
         }
      ]);

      const priorityStats = await Contact.aggregate([
         {
            $group: {
               _id: '$priority',
               count: { $sum: 1 }
            }
         }
      ]);

      const inquiryTypeStats = await Contact.aggregate([
         {
            $group: {
               _id: '$inquiryType',
               count: { $sum: 1 }
            }
         }
      ]);

      const totalContacts = await Contact.countDocuments();
      const newContacts = await Contact.countDocuments({ status: 'new' });
      const resolvedContacts = await Contact.countDocuments({ status: 'resolved' });

      res.status(200).json({
         success: true,
         data: {
            total: totalContacts,
            new: newContacts,
            resolved: resolvedContacts,
            statusBreakdown: stats,
            priorityBreakdown: priorityStats,
            inquiryTypeBreakdown: inquiryTypeStats
         }
      });
   } catch (error) {
      console.error('Get contact stats error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

module.exports = {
   submitContactForm,
   getAllContacts,
   getContact,
   updateContactStatus,
   respondToContact,
   getContactStats
};
