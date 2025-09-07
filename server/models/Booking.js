const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
   bookingNumber: {
      type: String,
      unique: true,
      required: true
   },
   customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Customer is required']
   },
   services: [{
      service: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Service',
         required: true
      },
      quantity: {
         type: Number,
         default: 1,
         min: 1
      },
      price: {
         type: Number,
         required: true
      }
   }],
   appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required']
   },
   startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
   },
   endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format']
   },
   therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
   },
   status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending'
   },
   paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially-paid', 'refunded', 'failed'],
      default: 'pending'
   },
   totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0
   },
   discount: {
      type: Number,
      default: 0,
      min: 0
   },
   tax: {
      type: Number,
      default: 0,
      min: 0
   },
   finalAmount: {
      type: Number,
      required: true,
      min: 0
   },
   paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'eft', 'voucher', 'loyalty-points'],
      default: 'card'
   },
   specialRequests: String,
   notes: String,
   cancellationReason: String,
   cancellationDate: Date,
   refundAmount: {
      type: Number,
      default: 0,
      min: 0
   },
   reminderSent: {
      type: Boolean,
      default: false
   },
   feedback: {
      rating: {
         type: Number,
         min: 1,
         max: 5
      },
      comment: String,
      submittedAt: Date
   },
   voucher: {
      code: String,
      discountAmount: Number
   },
   loyaltyPoints: {
      earned: {
         type: Number,
         default: 0
      },
      used: {
         type: Number,
         default: 0
      }
   }
}, {
   timestamps: true
});

// Generate booking number before saving
bookingSchema.pre('save', async function (next) {
   if (this.isNew) {
      const count = await this.constructor.countDocuments();
      this.bookingNumber = `MS${String(count + 1).padStart(6, '0')}`;
   }
   next();
});

// Index for better query performance
bookingSchema.index({ customer: 1, appointmentDate: 1 });
bookingSchema.index({ appointmentDate: 1, startTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingNumber: 1 });

// Virtual for appointment duration
bookingSchema.virtual('duration').get(function () {
   const start = new Date(`2000-01-01T${this.startTime}`);
   const end = new Date(`2000-01-01T${this.endTime}`);
   return (end - start) / (1000 * 60); // duration in minutes
});

// Virtual for formatted appointment date
bookingSchema.virtual('formattedDate').get(function () {
   return this.appointmentDate.toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
   });
});

// Method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function () {
   const now = new Date();
   const appointmentDateTime = new Date(this.appointmentDate);
   const timeDiff = appointmentDateTime - now;
   const hoursDiff = timeDiff / (1000 * 60 * 60);

   return hoursDiff >= 24 && this.status === 'confirmed'; // Can cancel if more than 24 hours notice
};

// Method to calculate refund amount
bookingSchema.methods.calculateRefund = function () {
   if (!this.canBeCancelled()) {
      return 0;
   }

   const now = new Date();
   const appointmentDateTime = new Date(this.appointmentDate);
   const timeDiff = appointmentDateTime - now;
   const hoursDiff = timeDiff / (1000 * 60 * 60);

   if (hoursDiff >= 48) {
      return this.finalAmount; // Full refund
   } else if (hoursDiff >= 24) {
      return this.finalAmount * 0.5; // 50% refund
   }

   return 0;
};

module.exports = mongoose.model('Booking', bookingSchema);
