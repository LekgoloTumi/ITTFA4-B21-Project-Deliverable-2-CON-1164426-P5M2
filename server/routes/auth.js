const express = require('express');
const router = express.Router();
const {
   register,
   login,
   logout,
   getMe,
   updateProfile,
   changePassword,
   forgotPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
   validateUserRegistration,
   validateUserLogin
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
