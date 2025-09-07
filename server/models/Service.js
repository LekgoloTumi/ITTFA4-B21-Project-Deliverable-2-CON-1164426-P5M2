const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters']
   },
   description: {
      type: String,
      required: [true, 'Service description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
   },
   category: {
      type: String,
      required: [true, 'Service category is required'],
      enum: ['spa', 'beauty', 'wellness', 'massage', 'facial', 'body-treatment', 'couples', 'corporate']
   },
   subcategory: {
      type: String,
      trim: true
   },
   duration: {
      type: Number,
      required: [true, 'Service duration is required'],
      min: [15, 'Duration must be at least 15 minutes']
   },
   price: {
      type: Number,
      required: [true, 'Service price is required'],
      min: [0, 'Price cannot be negative']
   },
   originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative']
   },
   images: [{
      url: String,
      alt: String,
      isPrimary: {
         type: Boolean,
         default: false
      }
   }],
   features: [String],
   benefits: [String],
   suitableFor: {
      type: String,
      enum: ['all', 'men', 'women', 'pregnant-women', 'children'],
      default: 'all'
   },
   contraindications: [String],
   preparation: String,
   aftercare: String,
   isActive: {
      type: Boolean,
      default: true
   },
   isPopular: {
      type: Boolean,
      default: false
   },
   isNew: {
      type: Boolean,
      default: false
   },
   maxParticipants: {
      type: Number,
      default: 1,
      min: 1
   },
   requiresConsultation: {
      type: Boolean,
      default: false
   },
   ageRestriction: {
      minAge: {
         type: Number,
         default: 0
      },
      maxAge: Number
   },
   tags: [String],
   seoTitle: String,
   seoDescription: String,
   sortOrder: {
      type: Number,
      default: 0
   }
}, {
   timestamps: true
});

// Index for better search performance
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text' });
serviceSchema.index({ price: 1 });
serviceSchema.index({ isPopular: 1, isActive: 1 });

// Virtual for discount percentage
serviceSchema.virtual('discountPercentage').get(function () {
   if (this.originalPrice && this.originalPrice > this.price) {
      return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
   }
   return 0;
});

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function () {
   return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
   }).format(this.price);
});

module.exports = mongoose.model('Service', serviceSchema);
