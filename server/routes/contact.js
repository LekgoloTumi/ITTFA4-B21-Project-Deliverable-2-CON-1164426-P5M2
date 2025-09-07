const express = require('express');
const router = express.Router();
const {
   submitContactForm,
   getAllContacts,
   getContact,
   updateContactStatus,
   respondToContact,
   getContactStats
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/auth');
const { validateContactForm } = require('../middleware/validation');

// Public routes
router.post('/', validateContactForm, submitContactForm);

// Admin routes
router.get('/', protect, authorize('admin', 'manager'), getAllContacts);
router.get('/stats', protect, authorize('admin', 'manager'), getContactStats);
router.get('/:id', protect, authorize('admin', 'manager'), getContact);
router.put('/:id/status', protect, authorize('admin', 'manager'), updateContactStatus);
router.post('/:id/respond', protect, authorize('admin', 'manager'), respondToContact);

module.exports = router;
