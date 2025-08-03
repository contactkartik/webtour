// backend/models/Booking.js
const mongoose = require('mongoose');
const { sendBookingConfirmation, sendBookingNotification } = require('../services/emailService');

const bookingSchema = new mongoose.Schema({
  // Customer Information
  user: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Customer name must be at least 2 characters'],
    maxlength: [50, 'Customer name cannot exceed 50 characters']
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Remove spaces, dashes, parentheses
        const cleaned = v.replace(/[\s\-\(\)]/g, '');
        // Check if it's 10-16 digits
        return /^\d{10,16}$/.test(cleaned);
      },
      message: 'Contact number must be 10-16 digits'
    }
  },

  // Trip Details
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true,
    minlength: [2, 'Destination must be at least 2 characters']
  },
  date: {
    type: Date,
    required: [true, 'Travel date is required'],
    validate: {
      validator: function(v) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return v >= today;
      },
      message: 'Travel date cannot be in the past'
    }
  },
  people: {
    type: Number,
    required: [true, 'Number of people is required'],
    min: [1, 'At least 1 person is required'],
    max: [20, 'Maximum 20 people allowed']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  specialRequests: {
    type: String,
    trim: true,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },

  // Booking Management
  bookingReference: {
    type: String,
    unique: true,
    uppercase: true
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },

  // Metadata
  source: {
    type: String,
    default: 'website'
  },
  ipAddress: String,
  userAgent: String,

  // Email Status
  emailSent: {
    confirmation: { type: Boolean, default: false },
    notification: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    // Generate format: WW-YYYYMMDD-XXXX (WW = WanderWise, date, random)
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    this.bookingReference = `WW-${dateStr}-${random}`;
  }
  next();
});

// Send emails after saving
bookingSchema.post('save', async function(doc) {
  try {
    // Send confirmation email to customer
    if (!doc.emailSent.confirmation) {
      const emailData = doc.getEmailData();
      const confirmationResult = await sendBookingConfirmation(emailData);
      
      if (confirmationResult.success) {
        doc.emailSent.confirmation = true;
        console.log('✅ Confirmation email sent for:', doc.bookingReference);
      }
    }

    // Send notification email to team
    if (!doc.emailSent.notification) {
      const emailData = doc.getEmailData();
      const notificationResult = await sendBookingNotification(emailData);
      
      if (notificationResult.success) {
        doc.emailSent.notification = true;
        console.log('✅ Team notification sent for:', doc.bookingReference);
      }
    }

    // Update email status if needed (without triggering another save)
    if (!doc.emailSent.confirmation || !doc.emailSent.notification) {
      await mongoose.model('Booking').updateOne(
        { _id: doc._id },
        { $set: { emailSent: doc.emailSent } }
      );
    }

  } catch (error) {
    console.error('❌ Error sending emails for booking:', doc.bookingReference, error);
  }
});

// Instance Methods
bookingSchema.methods.getEmailData = function() {
  return {
    customerEmail: this.customerEmail,
    customerName: this.user,
    destination: this.destination,
    date: this.date,
    travelers: this.people,
    totalAmount: this.totalAmount,
    bookingReference: this.bookingReference,
    contactNumber: this.contactNumber,
    specialRequests: this.specialRequests,
    formattedDate: this.date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
};

bookingSchema.methods.getPaymentUrl = function() {
  // You can integrate with payment gateway here
  return `${process.env.CLIENT_URL}/payment/${this.bookingReference}`;
};

bookingSchema.methods.canBeCancelled = function() {
  // Can cancel if travel date is more than 24 hours away and not already processed
  const now = new Date();
  const travelDate = new Date(this.date);
  const hoursDiff = (travelDate - now) / (1000 * 60 * 60);
  
  return hoursDiff > 24 && 
         this.bookingStatus !== 'cancelled' && 
         this.paymentStatus !== 'refunded';
};

// Static Methods
bookingSchema.statics.getBookingStats = async function(startDate, endDate) {
  const matchStage = {};
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        avgBookingValue: { $avg: '$totalAmount' },
        totalTravelers: { $sum: '$people' },
        statusBreakdown: {
          $push: {
            status: '$bookingStatus',
            paymentStatus: '$paymentStatus'
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalBookings: 0,
    totalRevenue: 0,
    avgBookingValue: 0,
    totalTravelers: 0,
    statusBreakdown: []
  };
};

bookingSchema.statics.searchBookings = async function(query, options = {}) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    order = 'desc'
  } = options;

  const searchRegex = new RegExp(query, 'i');
  const searchQuery = {
    $or: [
      { user: searchRegex },
      { destination: searchRegex },
      { bookingReference: searchRegex },
      { customerEmail: searchRegex }
    ]
  };

  const sortOptions = {};
  sortOptions[sortBy] = order === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [bookings, total] = await Promise.all([
    this.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    this.countDocuments(searchQuery)
  ]);

  return {
    bookings,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  };
};

// Indexes for performance
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ customerEmail: 1 });
bookingSchema.index({ date: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ bookingStatus: 1, paymentStatus: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;