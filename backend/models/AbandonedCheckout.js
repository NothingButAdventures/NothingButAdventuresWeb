const mongoose = require('mongoose');

const abandonedCheckoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Checkout session must belong to a user'],
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Checkout session must reference a tour'],
    },
    startDate: {
      type: Date,
      required: [true, 'Checkout session must reference a start date'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
abandonedCheckoutSchema.index({ user: 1, tour: 1, startDate: 1, status: 1 });
abandonedCheckoutSchema.index({ status: 1, emailSent: 1, createdAt: 1 });

const AbandonedCheckout = mongoose.model('AbandonedCheckout', abandonedCheckoutSchema);

module.exports = AbandonedCheckout;
