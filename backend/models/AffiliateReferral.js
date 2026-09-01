const mongoose = require("mongoose");

const affiliateReferralSchema = new mongoose.Schema(
  {
    affiliate: {
      type: mongoose.Schema.ObjectId,
      ref: "Affiliate",
      required: [true, "Referral must belong to an affiliate"],
    },

    // Visitor tracking
    visitorId: {
      type: String,
      required: true,
      trim: true,
    },

    // Conversion chain
    referredUser: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: "Booking",
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
    },

    // Status flow: clicked → signed_up → booked → commission_locked → commission_paid
    status: {
      type: String,
      enum: [
        "clicked",
        "signed_up",
        "booked",
        "commission_locked",
        "commission_paid",
        "expired",
      ],
      default: "clicked",
    },

    // Commission
    commissionRate: {
      type: Number,
      min: 0,
      max: 50,
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
    bookingAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },

    // Tracking metadata
    source: {
      type: String,
      trim: true,
    },
    landingPage: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },

    // Timestamps
    clickedAt: {
      type: Date,
      default: Date.now,
    },
    signedUpAt: Date,
    bookedAt: Date,
    lockedAt: Date,
    paidAt: Date,

    // Cookie expiry (30 days from click)
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
affiliateReferralSchema.index({ affiliate: 1, status: 1 });
affiliateReferralSchema.index({ visitorId: 1 });
affiliateReferralSchema.index({ referredUser: 1 });
affiliateReferralSchema.index({ booking: 1 });
affiliateReferralSchema.index({ status: 1 });
affiliateReferralSchema.index({ clickedAt: -1 });
affiliateReferralSchema.index({ expiresAt: 1 });

// Compound indexes
affiliateReferralSchema.index({ affiliate: 1, clickedAt: -1 });
affiliateReferralSchema.index({ visitorId: 1, expiresAt: 1 });

// Virtual: check if referral is still within cookie window
affiliateReferralSchema.virtual("isActive").get(function () {
  return (
    this.expiresAt > new Date() &&
    !["expired", "commission_paid"].includes(this.status)
  );
});

// Pre-save: set expiresAt if not already set
affiliateReferralSchema.pre("save", function (next) {
  if (this.isNew && !this.expiresAt) {
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    this.expiresAt = new Date(
      (this.clickedAt || Date.now()) + THIRTY_DAYS
    );
  }
  next();
});

// Static: get conversion stats for an affiliate
affiliateReferralSchema.statics.getConversionStats = async function (
  affiliateId,
  dateRange = {}
) {
  const matchStage = { affiliate: new mongoose.Types.ObjectId(affiliateId) };
  if (dateRange.start) matchStage.clickedAt = { $gte: dateRange.start };
  if (dateRange.end) {
    matchStage.clickedAt = matchStage.clickedAt || {};
    matchStage.clickedAt.$lte = dateRange.end;
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalClicks: { $sum: 1 },
        totalSignups: {
          $sum: {
            $cond: [
              { $in: ["$status", ["signed_up", "booked", "commission_locked", "commission_paid"]] },
              1,
              0,
            ],
          },
        },
        totalBookings: {
          $sum: {
            $cond: [
              { $in: ["$status", ["booked", "commission_locked", "commission_paid"]] },
              1,
              0,
            ],
          },
        },
        totalCommission: {
          $sum: "$commissionAmount",
        },
        totalBookingRevenue: {
          $sum: "$bookingAmount",
        },
      },
    },
  ]);

  return stats.length > 0
    ? stats[0]
    : {
        totalClicks: 0,
        totalSignups: 0,
        totalBookings: 0,
        totalCommission: 0,
        totalBookingRevenue: 0,
      };
};

const AffiliateReferral = mongoose.model(
  "AffiliateReferral",
  affiliateReferralSchema
);

module.exports = AffiliateReferral;
