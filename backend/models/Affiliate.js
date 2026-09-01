const mongoose = require("mongoose");
const crypto = require("crypto");

const affiliateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Affiliate must be linked to a user"],
      unique: true,
    },

    // Application Details
    type: {
      type: String,
      enum: ["affiliate", "rep"],
      required: [true, "Please specify if you are an affiliate or rep"],
    },
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    website: {
      type: String,
      trim: true,
    },
    socialMedia: {
      instagram: { type: String, trim: true },
      youtube: { type: String, trim: true },
      tiktok: { type: String, trim: true },
      facebook: { type: String, trim: true },
      twitter: { type: String, trim: true },
      blog: { type: String, trim: true },
    },
    audienceSize: {
      type: String,
      enum: [
        "under_1k",
        "1k_5k",
        "5k_10k",
        "10k_50k",
        "50k_100k",
        "100k_500k",
        "500k_plus",
      ],
    },
    niche: {
      type: String,
      trim: true,
      maxlength: [200, "Niche description cannot exceed 200 characters"],
    },
    whyJoin: {
      type: String,
      trim: true,
      maxlength: [1000, "Motivation text cannot exceed 1000 characters"],
    },
    country: {
      type: String,
      trim: true,
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },

    // Affiliate Code
    affiliateCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    // Commission Settings
    commissionRate: {
      type: Number,
      default: 5,
      min: [0, "Commission rate cannot be negative"],
      max: [50, "Commission rate cannot exceed 50%"],
    },
    tier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      default: "bronze",
    },

    // Tracking Stats (cached / denormalized for performance)
    stats: {
      totalClicks: { type: Number, default: 0 },
      totalSignups: { type: Number, default: 0 },
      totalBookings: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      totalCommissionEarned: { type: Number, default: 0 },
      totalCommissionPaid: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
    },

    // Payout History
    payouts: [
      {
        amount: {
          type: Number,
          required: true,
        },
        currency: {
          type: String,
          default: "USD",
        },
        method: {
          type: String,
          enum: ["bank_transfer", "paypal", "stripe", "manual"],
          default: "manual",
        },
        status: {
          type: String,
          enum: ["pending", "processing", "completed", "failed"],
          default: "pending",
        },
        transactionId: String,
        notes: String,
        processedBy: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        paidAt: Date,
      },
    ],

    // Timestamps
    approvedAt: Date,
    rejectedAt: Date,
    suspendedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
affiliateSchema.index({ status: 1 });
affiliateSchema.index({ type: 1 });
affiliateSchema.index({ tier: 1 });
affiliateSchema.index({ createdAt: -1 });

// Virtual: pending commission (earned - paid)
affiliateSchema.virtual("pendingCommission").get(function () {
  return this.stats.totalCommissionEarned - this.stats.totalCommissionPaid;
});

// Virtual populate for referrals
affiliateSchema.virtual("referrals", {
  ref: "AffiliateReferral",
  foreignField: "affiliate",
  localField: "_id",
});

// Generate unique affiliate code
affiliateSchema.methods.generateAffiliateCode = function (userName) {
  const cleanName = (userName || "NBA")
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 6)
    .toUpperCase();
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase().substring(0, 4);
  return `NBA-${cleanName}-${randomSuffix}`;
};

// Update tier based on bookings
affiliateSchema.methods.updateTier = function () {
  const bookings = this.stats.totalBookings;
  if (bookings >= 50) {
    this.tier = "platinum";
    this.commissionRate = Math.max(this.commissionRate, 10);
  } else if (bookings >= 25) {
    this.tier = "gold";
    this.commissionRate = Math.max(this.commissionRate, 7.5);
  } else if (bookings >= 10) {
    this.tier = "silver";
    this.commissionRate = Math.max(this.commissionRate, 6);
  } else {
    this.tier = "bronze";
  }
};

// Static: get aggregate stats for admin dashboard
affiliateSchema.statics.getAggregateStats = async function () {
  const stats = await this.aggregate([
    {
      $facet: {
        statusCounts: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ],
        totals: [
          {
            $group: {
              _id: null,
              totalAffiliates: { $sum: 1 },
              totalRevenue: { $sum: "$stats.totalRevenue" },
              totalCommissionEarned: { $sum: "$stats.totalCommissionEarned" },
              totalCommissionPaid: { $sum: "$stats.totalCommissionPaid" },
              totalBookings: { $sum: "$stats.totalBookings" },
              totalClicks: { $sum: "$stats.totalClicks" },
            },
          },
        ],
        tierCounts: [
          {
            $match: { status: "approved" },
          },
          { $group: { _id: "$tier", count: { $sum: 1 } } },
        ],
      },
    },
  ]);

  return stats[0];
};

const Affiliate = mongoose.model("Affiliate", affiliateSchema);

module.exports = Affiliate;
