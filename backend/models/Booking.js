const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a tour']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a user']
  },
  startDate: {
    type: Date,
    required: [true, 'Booking must have a start date']
  },
  travelers: [{
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    nationality: {
      type: String,
      required: true
    },
    passportNumber: {
      type: String,
      required: true
    },
    passportExpiry: {
      type: Date,
      required: true
    },
    specialRequests: String,
    emergencyContact: {
      name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      relationship: {
        type: String,
        required: true
      }
    }
  }],
  numberOfTravelers: {
    type: Number,
    required: true,
    min: [1, 'Must have at least 1 traveler']
  },
  price: {
    basePrice: {
      type: Number,
      required: true
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      default: 'USD'
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'stripe'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'refunded', 'failed'],
      default: 'pending'
    },
    transactions: [{
      transactionId: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        required: true
      },
      paymentDate: {
        type: Date,
        default: Date.now
      },
      gateway: String,
      gatewayResponse: mongoose.Schema.Types.Mixed
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  bookingReference: {
    type: String,
    unique: true
  },
  specialRequests: {
    dietary: [String],
    accessibility: String,
    roomPreference: {
      type: String,
      enum: ['single', 'twin', 'double', 'triple']
    },
    other: String
  },
  communication: [{
    date: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['email', 'sms', 'phone', 'in_app']
    },
    subject: String,
    message: String,
    sender: {
      type: String,
      enum: ['system', 'admin', 'user']
    }
  }],
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'declined'],
      default: 'pending'
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['itinerary', 'voucher', 'invoice', 'ticket', 'insurance']
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookingSchema.index({ user: 1 });
bookingSchema.index({ tour: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startDate: 1 });
bookingSchema.index({ 'payment.status': 1 });
bookingSchema.index({ createdAt: -1 });

// Compound indexes
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ tour: 1, startDate: 1 });

// Pre-save middleware to generate booking reference
bookingSchema.pre('save', function(next) {
  if (this.isNew) {
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.bookingReference = `NXT-${timestamp.slice(-8)}-${randomNum}`;
  }
  next();
});

// Pre-save middleware to calculate total price
bookingSchema.pre('save', function(next) {
  if (this.isModified('price.basePrice') || this.isModified('price.discountAmount') || this.isModified('price.taxes')) {
    this.price.totalPrice = (this.price.basePrice - this.price.discountAmount + this.price.taxes) * this.numberOfTravelers;
  }
  next();
});

// Static method to get booking statistics
bookingSchema.statics.getBookingStats = async function(filters = {}) {
  const matchStage = { ...filters };
  
  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$price.totalPrice' },
        averageBookingValue: { $avg: '$price.totalPrice' },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : null;
};

// Instance method to calculate refund amount based on cancellation policy
bookingSchema.methods.calculateRefund = function() {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const daysDifference = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));

  let refundPercentage = 0;

  if (daysDifference >= 30) {
    refundPercentage = 90; // 90% refund if cancelled 30+ days before
  } else if (daysDifference >= 14) {
    refundPercentage = 75; // 75% refund if cancelled 14-29 days before
  } else if (daysDifference >= 7) {
    refundPercentage = 50; // 50% refund if cancelled 7-13 days before
  } else if (daysDifference >= 3) {
    refundPercentage = 25; // 25% refund if cancelled 3-6 days before
  }
  // No refund if cancelled less than 3 days before

  return (this.price.totalPrice * refundPercentage) / 100;
};

// Instance method to send confirmation email
bookingSchema.methods.sendConfirmationEmail = function() {
  // Implementation for sending confirmation email
  // This would integrate with your email service
  console.log(`Sending confirmation email for booking ${this.bookingReference}`);
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;