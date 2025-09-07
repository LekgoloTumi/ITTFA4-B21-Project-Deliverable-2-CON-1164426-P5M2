const Newsletter = require('../models/Newsletter');
const { sendEmail } = require('../utils/email');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = async (req, res) => {
   try {
      const { email, firstName, lastName, preferences } = req.body;

      // Check if already subscribed
      const existingSubscriber = await Newsletter.findOne({ email });
      if (existingSubscriber) {
         if (existingSubscriber.status === 'unsubscribed') {
            // Resubscribe
            existingSubscriber.status = 'active';
            if (firstName) existingSubscriber.firstName = firstName;
            if (lastName) existingSubscriber.lastName = lastName;
            if (preferences) existingSubscriber.preferences = preferences;
            await existingSubscriber.save();

            return res.status(200).json({
               success: true,
               message: 'Successfully resubscribed to our newsletter!'
            });
         } else {
            return res.status(400).json({
               success: false,
               message: 'Email is already subscribed to our newsletter'
            });
         }
      }

      // Create new subscription
      const subscriber = await Newsletter.create({
         email,
         firstName,
         lastName,
         preferences,
         ipAddress: req.ip,
         userAgent: req.get('User-Agent')
      });

      // Send welcome email
      try {
         await sendEmail({
            email: email,
            subject: 'Welcome to Mowana Spa Newsletter!',
            message: `
Dear ${firstName || 'Valued Guest'},

Welcome to the Mowana Spa newsletter! We're excited to have you join our wellness community.

You'll receive:
• Exclusive spa offers and promotions
• Wellness tips and beauty advice
• Event invitations and special announcements
• Seasonal treatment recommendations

Thank you for choosing Mowana Spa for your wellness journey.

Best regards,
The Mowana Spa Team

To unsubscribe, click here: ${req.protocol}://${req.get('host')}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}
        `
         });
      } catch (emailError) {
         console.error('Failed to send welcome email:', emailError);
         // Don't fail the request if email fails
      }

      res.status(201).json({
         success: true,
         message: 'Successfully subscribed to our newsletter!'
      });
   } catch (error) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error. Please try again later.'
      });
   }
};

// @desc    Unsubscribe from newsletter
// @route   GET /api/newsletter/unsubscribe/:token
// @access  Public
const unsubscribe = async (req, res) => {
   try {
      const { token } = req.params;

      const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
      if (!subscriber) {
         return res.status(404).json({
            success: false,
            message: 'Invalid unsubscribe link'
         });
      }

      subscriber.status = 'unsubscribed';
      await subscriber.save();

      res.status(200).json({
         success: true,
         message: 'Successfully unsubscribed from our newsletter'
      });
   } catch (error) {
      console.error('Newsletter unsubscribe error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

// @desc    Get all subscribers (Admin)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
const getAllSubscribers = async (req, res) => {
   try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (status) filter.status = status;

      const subscribers = await Newsletter.find(filter)
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(limit);

      const total = await Newsletter.countDocuments(filter);

      res.status(200).json({
         success: true,
         count: subscribers.length,
         total,
         page,
         pages: Math.ceil(total / limit),
         data: subscribers
      });
   } catch (error) {
      console.error('Get subscribers error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

// @desc    Send newsletter (Admin)
// @route   POST /api/newsletter/send
// @access  Private/Admin
const sendNewsletter = async (req, res) => {
   try {
      const { subject, message, type, targetAudience } = req.body;

      // Build filter for target audience
      let filter = { status: 'active' };

      if (targetAudience === 'spa-updates') {
         filter['preferences.spaUpdates'] = true;
      } else if (targetAudience === 'special-offers') {
         filter['preferences.specialOffers'] = true;
      } else if (targetAudience === 'events') {
         filter['preferences.events'] = true;
      } else if (targetAudience === 'wellness-tips') {
         filter['preferences.wellnessTips'] = true;
      }

      const subscribers = await Newsletter.find(filter);

      if (subscribers.length === 0) {
         return res.status(400).json({
            success: false,
            message: 'No active subscribers found for the selected audience'
         });
      }

      let successCount = 0;
      let failCount = 0;

      // Send emails to all subscribers
      for (const subscriber of subscribers) {
         try {
            await sendEmail({
               email: subscriber.email,
               subject: subject,
               message: `
Dear ${subscriber.fullName},

${message}

Best regards,
The Mowana Spa Team

To unsubscribe, click here: ${req.protocol}://${req.get('host')}/api/newsletter/unsubscribe/${subscriber.unsubscribeToken}
          `
            });

            // Update subscriber stats
            subscriber.lastEmailSent = new Date();
            subscriber.emailCount += 1;
            await subscriber.save();

            successCount++;
         } catch (emailError) {
            console.error(`Failed to send email to ${subscriber.email}:`, emailError);
            failCount++;
         }
      }

      res.status(200).json({
         success: true,
         message: `Newsletter sent successfully`,
         stats: {
            total: subscribers.length,
            successful: successCount,
            failed: failCount
         }
      });
   } catch (error) {
      console.error('Send newsletter error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

// @desc    Get newsletter statistics
// @route   GET /api/newsletter/stats
// @access  Private/Admin
const getNewsletterStats = async (req, res) => {
   try {
      const totalSubscribers = await Newsletter.countDocuments();
      const activeSubscribers = await Newsletter.countDocuments({ status: 'active' });
      const unsubscribed = await Newsletter.countDocuments({ status: 'unsubscribed' });
      const bounced = await Newsletter.countDocuments({ status: 'bounced' });

      const statusStats = await Newsletter.aggregate([
         {
            $group: {
               _id: '$status',
               count: { $sum: 1 }
            }
         }
      ]);

      const sourceStats = await Newsletter.aggregate([
         {
            $group: {
               _id: '$source',
               count: { $sum: 1 }
            }
         }
      ]);

      const recentSubscriptions = await Newsletter.find({ status: 'active' })
         .sort({ createdAt: -1 })
         .limit(5)
         .select('email firstName lastName createdAt');

      res.status(200).json({
         success: true,
         data: {
            total: totalSubscribers,
            active: activeSubscribers,
            unsubscribed,
            bounced,
            statusBreakdown: statusStats,
            sourceBreakdown: sourceStats,
            recentSubscriptions
         }
      });
   } catch (error) {
      console.error('Get newsletter stats error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

// @desc    Update subscriber preferences
// @route   PUT /api/newsletter/preferences/:token
// @access  Public
const updatePreferences = async (req, res) => {
   try {
      const { token } = req.params;
      const { preferences } = req.body;

      const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
      if (!subscriber) {
         return res.status(404).json({
            success: false,
            message: 'Subscriber not found'
         });
      }

      subscriber.preferences = { ...subscriber.preferences, ...preferences };
      await subscriber.save();

      res.status(200).json({
         success: true,
         message: 'Preferences updated successfully',
         data: subscriber.preferences
      });
   } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

module.exports = {
   subscribe,
   unsubscribe,
   getAllSubscribers,
   sendNewsletter,
   getNewsletterStats,
   updatePreferences
};
