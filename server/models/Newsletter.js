const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
   email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
   },
   firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
   },
   lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
   },
   status: {
      type: String,
      enum: ['active', 'unsubscribed', 'bounced', 'complained'],
      default: 'active'
   },
   preferences: {
      spaUpdates: {
         type: Boolean,
         default: true
      },
      specialOffers: {
         type: Boolean,
         default: true
      },
      events: {
         type: Boolean,
         default: true
      },
      wellnessTips: {
         type: Boolean,
         default: true
      }
   },
   source: {
      type: String,
      enum: ['website', 'booking', 'referral', 'manual'],
      default: 'website'
   },
   ipAddress: String,
   userAgent: String,
   unsubscribeToken: {
      type: String,
      unique: true
   },
   lastEmailSent: Date,
   emailCount: {
      type: Number,
      default: 0
   },
   tags: [String]
}, {
   timestamps: true
});

// Generate unsubscribe token before saving
newsletterSchema.pre('save', async function (next) {
   if (this.isNew && !this.unsubscribeToken) {
      const crypto = require('crypto');
      this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
   }
   next();
});

// Index for better query performance
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ unsubscribeToken: 1 });

// Virtual for full name
newsletterSchema.virtual('fullName').get(function () {
   if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
   }
   return this.firstName || this.lastName || 'Subscriber';
});

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function () {
   this.status = 'unsubscribed';
   return this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = function () {
   this.status = 'active';
   return this.save();
};

module.exports = mongoose.model('Newsletter', newsletterSchema);
