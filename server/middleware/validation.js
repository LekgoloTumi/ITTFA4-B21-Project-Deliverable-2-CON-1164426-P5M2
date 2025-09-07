const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
   const errors = validationResult(req);
   if (!errors.isEmpty()) {
      return res.status(400).json({
         success: false,
         message: 'Validation failed',
         errors: errors.array()
      });
   }
   next();
};

// User registration validation
const validateUserRegistration = [
   body('firstName')
      .trim()
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),

   body('lastName')
      .trim()
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),

   body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),

   body('phone')
      .matches(/^(\+27|0)[0-9]{9}$/)
      .withMessage('Please provide a valid South African phone number'),

   body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),

   body('dateOfBirth')
      .isISO8601()
      .withMessage('Please provide a valid date of birth'),

   body('gender')
      .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
      .withMessage('Please select a valid gender'),

   handleValidationErrors
];

// User login validation
const validateUserLogin = [
   body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),

   body('password')
      .notEmpty()
      .withMessage('Password is required'),

   handleValidationErrors
];

// Contact form validation
const validateContactForm = [
   body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),

   body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),

   body('phone')
      .optional()
      .matches(/^(\+27|0)[0-9]{9}$/)
      .withMessage('Please provide a valid South African phone number'),

   body('subject')
      .trim()
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ max: 200 })
      .withMessage('Subject cannot exceed 200 characters'),

   body('message')
      .trim()
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ max: 2000 })
      .withMessage('Message cannot exceed 2000 characters'),

   body('inquiryType')
      .optional()
      .isIn(['general', 'booking', 'complaint', 'compliment', 'partnership', 'media', 'other'])
      .withMessage('Please select a valid inquiry type'),

   handleValidationErrors
];

// Newsletter subscription validation
const validateNewsletterSubscription = [
   body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),

   body('firstName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('First name cannot exceed 50 characters'),

   body('lastName')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Last name cannot exceed 50 characters'),

   handleValidationErrors
];

// Booking validation
const validateBooking = [
   body('services')
      .isArray({ min: 1 })
      .withMessage('At least one service is required'),

   body('services.*.service')
      .isMongoId()
      .withMessage('Invalid service ID'),

   body('services.*.quantity')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),

   body('appointmentDate')
      .isISO8601()
      .withMessage('Please provide a valid appointment date'),

   body('startTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Please provide a valid start time'),

   body('endTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Please provide a valid end time'),

   body('specialRequests')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Special requests cannot exceed 500 characters'),

   handleValidationErrors
];

// Service validation
const validateService = [
   body('name')
      .trim()
      .notEmpty()
      .withMessage('Service name is required')
      .isLength({ max: 100 })
      .withMessage('Service name cannot exceed 100 characters'),

   body('description')
      .trim()
      .notEmpty()
      .withMessage('Service description is required')
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),

   body('category')
      .isIn(['spa', 'beauty', 'wellness', 'massage', 'facial', 'body-treatment', 'couples', 'corporate'])
      .withMessage('Please select a valid category'),

   body('duration')
      .isInt({ min: 15 })
      .withMessage('Duration must be at least 15 minutes'),

   body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),

   body('originalPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Original price must be a positive number'),

   handleValidationErrors
];

module.exports = {
   handleValidationErrors,
   validateUserRegistration,
   validateUserLogin,
   validateContactForm,
   validateNewsletterSubscription,
   validateBooking,
   validateService
};
