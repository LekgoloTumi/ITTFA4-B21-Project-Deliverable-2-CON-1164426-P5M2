const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
   firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
   },
   lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
   },
   email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
   },
   phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^(\+27|0)[0-9]{9}$/, 'Please enter a valid South African phone number']
   },
   password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
   },
   dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
   },
   gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      required: [true, 'Gender is required']
   },
   address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: {
         type: String,
         default: 'South Africa'
      }
   },
   emergencyContact: {
      name: String,
      phone: String,
      relationship: String
   },
   medicalInfo: {
      allergies: [String],
      medicalConditions: [String],
      medications: [String],
      pregnancyStatus: {
         type: String,
         enum: ['not-pregnant', 'pregnant', 'prefer-not-to-say'],
         default: 'not-pregnant'
      }
   },
   preferences: {
      preferredTherapist: String,
      preferredTime: String,
      specialRequests: String,
      marketingConsent: {
         type: Boolean,
         default: false
      }
   },
   role: {
      type: String,
      enum: ['customer', 'admin', 'therapist', 'manager'],
      default: 'customer'
   },
   isActive: {
      type: Boolean,
      default: true
   },
   lastLogin: Date,
   emailVerified: {
      type: Boolean,
      default: false
   },
   emailVerificationToken: String,
   passwordResetToken: String,
   passwordResetExpires: Date
}, {
   timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();

   this.password = await bcrypt.hash(this.password, 12);
   next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
   return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function () {
   return `${this.firstName} ${this.lastName}`;
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
   const user = this.toObject();
   delete user.password;
   delete user.emailVerificationToken;
   delete user.passwordResetToken;
   delete user.passwordResetExpires;
   return user;
};

module.exports = mongoose.model('User', userSchema);
