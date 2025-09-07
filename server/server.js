const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const newsletterRoutes = require('./routes/newsletter');

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet({
   contentSecurityPolicy: {
      directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
         fontSrc: ["'self'", "https://fonts.gstatic.com"],
         imgSrc: ["'self'", "data:", "https:"],
         scriptSrc: ["'self'"],
         connectSrc: ["'self'"]
      }
   }
}));

// CORS configuration
app.use(cors({
   origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
   credentials: true,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
   message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
   },
   standardHeaders: true,
   legacyHeaders: false
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
   app.use(morgan('dev'));
} else {
   app.use(morgan('combined'));
}

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
   res.status(200).json({
      success: true,
      message: 'Mowana Spa API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
   });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Root endpoint
app.get('/', (req, res) => {
   res.status(200).json({
      success: true,
      message: 'Welcome to Mowana Spa API',
      version: '1.0.0',
      documentation: '/api/docs',
      endpoints: {
         auth: '/api/auth',
         contact: '/api/contact',
         newsletter: '/api/newsletter'
      }
   });
});

// 404 handler
app.use('*', (req, res) => {
   res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`
   });
});

// Global error handler
app.use((err, req, res, next) => {
   console.error('Error:', err);

   // Mongoose validation error
   if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
         success: false,
         message: 'Validation Error',
         errors
      });
   }

   // Mongoose duplicate key error
   if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
         success: false,
         message: `${field} already exists`
      });
   }

   // JWT errors
   if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
         success: false,
         message: 'Invalid token'
      });
   }

   if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
         success: false,
         message: 'Token expired'
      });
   }

   // Default error
   res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
   });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
   console.log(`🚀 Mowana Spa API running on port ${PORT}`);
   console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
   console.log(`🌐 Health check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
   console.log(`Error: ${err.message}`);
   // Close server & exit process
   server.close(() => {
      process.exit(1);
   });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
   console.log(`Error: ${err.message}`);
   process.exit(1);
});

module.exports = app;
