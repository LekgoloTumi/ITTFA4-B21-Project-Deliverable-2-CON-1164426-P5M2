const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
   },
   email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
   },
   phone: {
      type: String,
      match: [/^(\+27|0)[0-9]{9}$/, 'Please enter a valid South African phone number']
   },
   subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters']
   },
   message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters']
   },
   inquiryType: {
      type: String,
      enum: ['general', 'booking', 'complaint', 'compliment', 'partnership', 'media', 'other'],
      default: 'general'
   },
   preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'either'],
      default: 'email'
   },
   status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved', 'closed'],
      default: 'new'
   },
   priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
   },
   assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   response: {
      message: String,
      respondedBy: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
      },
      respondedAt: Date
   },
   followUpDate: Date,
   tags: [String],
   source: {
      type: String,
      enum: ['website', 'phone', 'email', 'walk-in', 'social-media', 'referral'],
      default: 'website'
   },
   ipAddress: String,
   userAgent: String
}, {
   timestamps: true
});

// Index for better query performance
contactSchema.index({ status: 1, priority: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ email: 1 });

// Virtual for full contact info
contactSchema.virtual('contactInfo').get(function () {
   return {
      name: this.name,
      email: this.email,
      phone: this.phone || 'Not provided'
   };
});

// Method to mark as resolved
contactSchema.methods.markAsResolved = function (userId, responseMessage) {
   this.status = 'resolved';
   this.response = {
      message: responseMessage,
      respondedBy: userId,
      respondedAt: new Date()
   };
   return this.save();
};

module.exports = mongoose.model('Contact', contactSchema);
