const express = require('express');
const router = express.Router();
const {
   subscribe,
   unsubscribe,
   getAllSubscribers,
   sendNewsletter,
   getNewsletterStats,
   updatePreferences
} = require('../controllers/newsletterController');
const { protect, authorize } = require('../middleware/auth');
const { validateNewsletterSubscription } = require('../middleware/validation');

// Public routes
router.post('/subscribe', validateNewsletterSubscription, subscribe);
router.get('/unsubscribe/:token', unsubscribe);
router.put('/preferences/:token', updatePreferences);

// Admin routes
router.get('/subscribers', protect, authorize('admin', 'manager'), getAllSubscribers);
router.get('/stats', protect, authorize('admin', 'manager'), getNewsletterStats);
router.post('/send', protect, authorize('admin', 'manager'), sendNewsletter);

module.exports = router;
