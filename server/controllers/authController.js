const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

// Generate JWT Token
const generateToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
   });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
   try {
      const {
         firstName,
         lastName,
         email,
         phone,
         password,
         dateOfBirth,
         gender,
         address,
         emergencyContact,
         medicalInfo,
         preferences
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return res.status(400).json({
            success: false,
            message: 'User already exists with this email'
         });
      }

      // Create user
      const user = await User.create({
         firstName,
         lastName,
         email,
         phone,
         password,
         dateOfBirth,
         gender,
         address,
         emergencyContact,
         medicalInfo,
         preferences
      });

      // Generate token
      const token = generateToken(user._id);

      // Set cookie
      res.cookie('token', token, {
         expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict'
      });

      res.status(201).json({
         success: true,
         message: 'User registered successfully',
         token,
         user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role
         }
      });
   } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error during registration'
      });
   }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
   try {
      const { email, password } = req.body;

      // Check if user exists and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
         return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
         });
      }

      // Check if user is active
      if (!user.isActive) {
         return res.status(401).json({
            success: false,
            message: 'Account is deactivated'
         });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
         return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
         });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Set cookie
      res.cookie('token', token, {
         expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict'
      });

      res.status(200).json({
         success: true,
         message: 'Login successful',
         token,
         user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role
         }
      });
   } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error during login'
      });
   }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
   try {
      res.cookie('token', '', {
         expires: new Date(0),
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         sameSite: 'strict'
      });

      res.status(200).json({
         success: true,
         message: 'Logout successful'
      });
   } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error during logout'
      });
   }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
   try {
      const user = await User.findById(req.user.id);

      res.status(200).json({
         success: true,
         user
      });
   } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
   try {
      const {
         firstName,
         lastName,
         phone,
         address,
         emergencyContact,
         medicalInfo,
         preferences
      } = req.body;

      const user = await User.findById(req.user.id);

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      if (emergencyContact) user.emergencyContact = emergencyContact;
      if (medicalInfo) user.medicalInfo = medicalInfo;
      if (preferences) user.preferences = preferences;

      await user.save();

      res.status(200).json({
         success: true,
         message: 'Profile updated successfully',
         user
      });
   } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error during profile update'
      });
   }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
   try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id).select('+password');

      // Check current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
         return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
         });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
         success: true,
         message: 'Password changed successfully'
      });
   } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error during password change'
      });
   }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
   try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
         return res.status(404).json({
            success: false,
            message: 'No user found with this email'
         });
      }

      // Generate reset token
      const crypto = require('crypto');
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Hash token and set to user
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      await user.save();

      // Send reset email
      const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

      try {
         await sendEmail({
            email: user.email,
            subject: 'Password Reset Request',
            message: `You are receiving this email because you requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`
         });

         res.status(200).json({
            success: true,
            message: 'Password reset email sent'
         });
      } catch (error) {
         user.passwordResetToken = undefined;
         user.passwordResetExpires = undefined;
         await user.save();

         return res.status(500).json({
            success: false,
            message: 'Email could not be sent'
         });
      }
   } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
         success: false,
         message: 'Server error'
      });
   }
};

module.exports = {
   register,
   login,
   logout,
   getMe,
   updateProfile,
   changePassword,
   forgotPassword
};
