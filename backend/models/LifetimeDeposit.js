const mongoose = require("mongoose");

const lifetimeDepositSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "A lifetime deposit must have a code"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A lifetime deposit must belong to a user"],
    },
    travelerName: {
      type: String,
      required: [true, "A lifetime deposit must be associated with a traveler name"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "A lifetime deposit must have an amount"],
      min: [0, "Amount cannot be negative"],
    },
    originalBooking: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
      required: [true, "A lifetime deposit must reference the original booking"],
    },
    originalTour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "A lifetime deposit must reference the original tour"],
    },
    status: {
      type: String,
      enum: ["active", "used", "cancelled"],
      default: "active",
    },
    usedInBooking: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
      default: null,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexing for faster lookups
lifetimeDepositSchema.index({ code: 1 }, { unique: true });
lifetimeDepositSchema.index({ user: 1, status: 1 });

const LifetimeDeposit = mongoose.model("LifetimeDeposit", lifetimeDepositSchema);

module.exports = LifetimeDeposit;
