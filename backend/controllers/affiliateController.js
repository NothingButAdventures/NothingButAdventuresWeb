const crypto = require("crypto");
const Affiliate = require("../models/Affiliate");
const AffiliateReferral = require("../models/AffiliateReferral");
const User = require("../models/User");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// ─── PUBLIC / AUTHENTICATED ────────────────────────────────────────────────────

/**
 * Apply for the affiliate program (authenticated user)
 * POST /api/v1/affiliates/apply
 */
const applyForAffiliate = catchAsync(async (req, res, next) => {
  // Check if user already has an application
  const existing = await Affiliate.findOne({ user: req.user.id });
  if (existing) {
    if (existing.status === "rejected") {
      return next(
        new AppError(
          "Your previous application was rejected. Please contact affiliate@nothingbutadventures.com for assistance.",
          400
        )
      );
    }
    return next(
      new AppError(
        `You already have an affiliate application with status: ${existing.status}`,
        400
      )
    );
  }

  const {
    type,
    companyName,
    website,
    socialMedia,
    audienceSize,
    niche,
    whyJoin,
    country,
  } = req.body;

  if (!type) {
    return next(
      new AppError('Please specify your type: "affiliate" or "rep"', 400)
    );
  }

  const affiliate = await Affiliate.create({
    user: req.user.id,
    type,
    companyName,
    website,
    socialMedia,
    audienceSize,
    niche,
    whyJoin,
    country,
    status: "pending",
  });

  // Send application received email
  try {
    const {
      sendAffiliateApplicationReceivedEmail,
    } = require("../utils/emailService");
    await sendAffiliateApplicationReceivedEmail(req.user.email, {
      name: req.user.name,
      type,
      companyName,
    });
  } catch (err) {
    console.error("Failed to send affiliate application email:", err.message);
  }

  res.status(201).json({
    status: "success",
    message:
      "Your affiliate application has been submitted! We will review it and get back to you shortly.",
    data: {
      affiliate,
    },
  });
});

/**
 * Get my affiliate profile (authenticated affiliate)
 * GET /api/v1/affiliates/me
 */
const getMyAffiliateProfile = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.findOne({ user: req.user.id }).populate(
    "user",
    "name email avatar"
  );

  if (!affiliate) {
    return next(
      new AppError("You don't have an affiliate profile. Apply first!", 404)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      affiliate,
    },
  });
});

/**
 * Get my referrals (authenticated affiliate)
 * GET /api/v1/affiliates/me/referrals
 */
const getMyReferrals = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.findOne({ user: req.user.id });
  if (!affiliate) {
    return next(new AppError("Affiliate profile not found", 404));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = { affiliate: affiliate._id };
  if (req.query.status) filter.status = req.query.status;

  const referrals = await AffiliateReferral.find(filter)
    .sort("-clickedAt")
    .skip(skip)
    .limit(limit)
    .populate("referredUser", "name email")
    .populate("booking", "bookingReference price.totalPrice status")
    .populate("tour", "name slug");

  const total = await AffiliateReferral.countDocuments(filter);

  // Fetch all user accounts created via this affiliate's referral link
  const Booking = require("../models/Booking");
  const rawReferredUsers = await User.find({ referredByAffiliate: affiliate._id })
    .select("name email createdAt isEmailVerified")
    .sort("-createdAt")
    .lean();

  // Find bookings made by these referred users
  const userIds = rawReferredUsers.map((u) => u._id);
  const userBookings = await Booking.find({
    user: { $in: userIds },
    status: { $ne: "cancelled" },
  }).select("user price.totalPrice status createdAt");

  const referredUsers = rawReferredUsers.map((u) => {
    const userBks = userBookings.filter((b) => b.user?.toString() === u._id?.toString());
    const totalSpent = userBks.reduce((acc, b) => acc + (b.price?.totalPrice || 0), 0);
    return {
      _id: u._id,
      name: u.name,
      email: u.email,
      joinedAt: u.createdAt,
      isEmailVerified: u.isEmailVerified,
      bookingCount: userBks.length,
      totalSpent,
    };
  });

  res.status(200).json({
    status: "success",
    results: referrals.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    conversionStats,
    data: {
      referrals,
      referredUsers,
      totalReferredUsers: referredUsers.length,
    },
  });
});

/**
 * Get my payouts (authenticated affiliate)
 * GET /api/v1/affiliates/me/payouts
 */
const getMyPayouts = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.findOne({ user: req.user.id });
  if (!affiliate) {
    return next(new AppError("Affiliate profile not found", 404));
  }

  const payouts = affiliate.payouts.sort(
    (a, b) => new Date(b.requestedAt) - new Date(a.requestedAt)
  );

  res.status(200).json({
    status: "success",
    results: payouts.length,
    data: {
      payouts,
      pendingCommission: affiliate.pendingCommission,
      totalEarned: affiliate.stats.totalCommissionEarned,
      totalPaid: affiliate.stats.totalCommissionPaid,
    },
  });
});

/**
 * Track a referral click (public endpoint)
 * GET /api/v1/affiliates/track/:code
 *
 * Query params: ?dest=/trips/some-tour&src=instagram
 */
const trackReferralClick = catchAsync(async (req, res, next) => {
  const { code } = req.params;
  const destination = req.query.dest || "/";
  const source = req.query.src || "direct";
  const isJsonRequest = req.query.format === "json" || req.headers.accept?.includes("application/json") || req.xhr;

  const affiliate = await Affiliate.findOne({
    affiliateCode: code.toUpperCase(),
    status: "approved",
  }).populate("user", "name");

  if (!affiliate) {
    if (isJsonRequest) {
      return res.status(404).json({
        status: "fail",
        message: "Invalid or inactive affiliate code",
      });
    }
    return res.redirect(destination);
  }

  // Generate or get visitor ID
  const visitorId =
    req.cookies?.nba_visitor_id ||
    crypto.randomBytes(16).toString("hex");

  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  // Create referral record
  await AffiliateReferral.create({
    affiliate: affiliate._id,
    visitorId,
    status: "clicked",
    source,
    landingPage: destination,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    clickedAt: new Date(),
    expiresAt: new Date(Date.now() + THIRTY_DAYS),
  });

  // Increment click count
  affiliate.stats.totalClicks += 1;
  await affiliate.save({ validateBeforeSave: false });

  // Set cookies
  const cookieOptions = {
    maxAge: THIRTY_DAYS,
    httpOnly: false, // Accessible by frontend JS as well
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  res.cookie("nba_aff_code", code.toUpperCase(), cookieOptions);
  res.cookie("nba_visitor_id", visitorId, cookieOptions);

  if (isJsonRequest) {
    return res.status(200).json({
      status: "success",
      message: "Referral click tracked",
      data: {
        affiliateCode: affiliate.affiliateCode,
        partnerName: affiliate.companyName || affiliate.user?.name || "Partner",
        type: affiliate.type,
      },
    });
  }

  res.redirect(destination);
});

// ─── ADMIN ─────────────────────────────────────────────────────────────────────

/**
 * Get all affiliates (admin)
 * GET /api/v1/affiliates
 */
const getAllAffiliates = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Affiliate.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const affiliates = await features.query.populate(
    "user",
    "name email avatar"
  );

  // Count totals for each status
  const statusFilter = {};
  if (req.query.status) statusFilter.status = req.query.status;
  if (req.query.type) statusFilter.type = req.query.type;

  const total = await Affiliate.countDocuments(statusFilter);

  res.status(200).json({
    status: "success",
    results: affiliates.length,
    total,
    data: {
      affiliates,
    },
  });
});

/**
 * Get aggregate affiliate stats (admin)
 * GET /api/v1/affiliates/stats
 */
const getAffiliateStats = catchAsync(async (req, res, next) => {
  const stats = await Affiliate.getAggregateStats();

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

/**
 * Get single affiliate by ID (admin)
 * GET /api/v1/affiliates/:id
 */
const getAffiliateById = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.findById(req.params.id).populate(
    "user",
    "name email avatar phone"
  );

  if (!affiliate) {
    return next(new AppError("Affiliate not found", 404));
  }

  // Get recent referrals
  const recentReferrals = await AffiliateReferral.find({
    affiliate: affiliate._id,
  })
    .sort("-clickedAt")
    .limit(20)
    .populate("referredUser", "name email")
    .populate("booking", "bookingReference price.totalPrice status")
    .populate("tour", "name slug");

  // Get conversion stats
  const conversionStats = await AffiliateReferral.getConversionStats(
    affiliate._id
  );

  res.status(200).json({
    status: "success",
    data: {
      affiliate,
      recentReferrals,
      conversionStats,
    },
  });
});

/**
 * Approve affiliate application (admin)
 * PATCH /api/v1/affiliates/:id/approve
 */
const approveAffiliate = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!affiliate) {
    return next(new AppError("Affiliate not found", 404));
  }

  if (affiliate.status === "approved") {
    return next(new AppError("This affiliate is already approved", 400));
  }

  // Generate unique affiliate code
  const affiliateCode = affiliate.generateAffiliateCode(
    affiliate.user?.name
  );

  affiliate.status = "approved";
  affiliate.affiliateCode = affiliateCode;
  affiliate.approvedAt = new Date();
  affiliate.commissionRate = req.body.commissionRate || 5;
  await affiliate.save({ validateBeforeSave: false });

  // Update user role to affiliate
  await User.findByIdAndUpdate(affiliate.user._id, { role: "affiliate" });

  // Send approval email
  try {
    const {
      sendAffiliateApprovedEmail,
    } = require("../utils/emailService");
    await sendAffiliateApprovedEmail(affiliate.user.email, {
      name: affiliate.user.name,
      affiliateCode,
      commissionRate: affiliate.commissionRate,
      type: affiliate.type,
    });
  } catch (err) {
    console.error("Failed to send affiliate approval email:", err.message);
  }

  res.status(200).json({
    status: "success",
    message: "Affiliate approved successfully",
    data: {
      affiliate,
    },
  });
});

/**
 * Reject affiliate application (admin)
 * PATCH /api/v1/affiliates/:id/reject
 */
const rejectAffiliate = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!affiliate) {
    return next(new AppError("Affiliate not found", 404));
  }

  affiliate.status = "rejected";
  affiliate.rejectedAt = new Date();
  affiliate.rejectionReason = req.body.reason || "Application did not meet our requirements at this time.";
  await affiliate.save({ validateBeforeSave: false });

  // Send rejection email
  try {
    const {
      sendAffiliateRejectedEmail,
    } = require("../utils/emailService");
    await sendAffiliateRejectedEmail(affiliate.user.email, {
      name: affiliate.user.name,
      reason: affiliate.rejectionReason,
    });
  } catch (err) {
    console.error("Failed to send affiliate rejection email:", err.message);
  }

  res.status(200).json({
    status: "success",
    message: "Affiliate application rejected",
    data: {
      affiliate,
    },
  });
});

/**
 * Suspend affiliate (admin)
 * PATCH /api/v1/affiliates/:id/suspend
 */
const suspendAffiliate = catchAsync(async (req, res, next) => {
  const affiliate = await Affiliate.findById(req.params.id);

  if (!affiliate) {
    return next(new AppError("Affiliate not found", 404));
  }

  affiliate.status = "suspended";
  affiliate.suspendedAt = new Date();
  await affiliate.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Affiliate suspended",
    data: {
      affiliate,
    },
  });
});

/**
 * Update commission rate (admin)
 * PATCH /api/v1/affiliates/:id/commission
 */
const updateCommissionRate = catchAsync(async (req, res, next) => {
  const { commissionRate } = req.body;

  if (commissionRate === undefined || commissionRate < 0 || commissionRate > 50) {
    return next(
      new AppError("Commission rate must be between 0 and 50%", 400)
    );
  }

  const affiliate = await Affiliate.findByIdAndUpdate(
    req.params.id,
    { commissionRate },
    { new: true, runValidators: true }
  );

  if (!affiliate) {
    return next(new AppError("Affiliate not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: `Commission rate updated to ${commissionRate}%`,
    data: {
      affiliate,
    },
  });
});

/**
 * Process payout for affiliate (admin)
 * POST /api/v1/affiliates/:id/payout
 */
const processAffiliatePayout = catchAsync(async (req, res, next) => {
  const { amount, method, transactionId, notes } = req.body;

  const affiliate = await Affiliate.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!affiliate) {
    return next(new AppError("Affiliate not found", 404));
  }

  if (affiliate.status !== "approved") {
    return next(new AppError("Can only process payouts for approved affiliates", 400));
  }

  const pendingCommission =
    affiliate.stats.totalCommissionEarned -
    affiliate.stats.totalCommissionPaid;

  if (!amount || amount <= 0) {
    return next(new AppError("Payout amount must be greater than 0", 400));
  }

  if (amount > pendingCommission) {
    return next(
      new AppError(
        `Payout amount ($${amount}) exceeds pending commission ($${pendingCommission.toFixed(2)})`,
        400
      )
    );
  }

  // Add payout record
  affiliate.payouts.push({
    amount,
    method: method || "manual",
    status: "completed",
    transactionId: transactionId || `PAY-${Date.now()}`,
    notes,
    processedBy: req.user.id,
    requestedAt: new Date(),
    paidAt: new Date(),
  });

  // Update stats
  affiliate.stats.totalCommissionPaid += amount;
  await affiliate.save({ validateBeforeSave: false });

  // Update referral statuses
  await AffiliateReferral.updateMany(
    {
      affiliate: affiliate._id,
      status: "commission_locked",
      commissionAmount: { $lte: amount },
    },
    { status: "commission_paid", paidAt: new Date() }
  );

  // Send payout email
  try {
    const {
      sendAffiliatePayoutProcessedEmail,
    } = require("../utils/emailService");
    await sendAffiliatePayoutProcessedEmail(affiliate.user.email, {
      name: affiliate.user.name,
      amount,
      method: method || "manual",
      transactionId: transactionId || `PAY-${Date.now()}`,
      remainingBalance: pendingCommission - amount,
    });
  } catch (err) {
    console.error("Failed to send payout email:", err.message);
  }

  res.status(200).json({
    status: "success",
    message: `Payout of $${amount} processed successfully`,
    data: {
      affiliate,
    },
  });
});

// ─── HELPER: Attribution on Booking ────────────────────────────────────────────

/**
 * Called from bookingController.createBooking to attribute a booking
 * to an affiliate if a referral cookie is present.
 */
const attributeBookingToAffiliate = async (req, booking, totalPrice) => {
  try {
    const affiliateCode = req.cookies?.nba_aff_code || req.body?.affiliateCode;
    const visitorId = req.cookies?.nba_visitor_id;

    let affiliate = null;
    if (affiliateCode) {
      affiliate = await Affiliate.findOne({
        affiliateCode: affiliateCode.toUpperCase(),
        status: "approved",
      });
    }

    // Fallback: check if the booking user was referred by an affiliate in the database
    if (!affiliate && req.user?.referredByAffiliate) {
      affiliate = await Affiliate.findOne({
        _id: req.user.referredByAffiliate,
        status: "approved",
      });
    }

    if (!affiliate) return;

    // Don't allow self-referral
    if (affiliate.user.toString() === req.user.id) return;

    // Calculate commission
    const commissionRate = affiliate.commissionRate;
    const commissionAmount = (totalPrice * commissionRate) / 100;

    // Check for existing referral from this visitor
    let referral = null;
    if (visitorId) {
      referral = await AffiliateReferral.findOne({
        affiliate: affiliate._id,
        visitorId,
        expiresAt: { $gt: new Date() },
        status: { $in: ["clicked", "signed_up"] },
      }).sort("-clickedAt");
    }

    if (referral) {
      // Update existing referral
      referral.status = "booked";
      referral.booking = booking._id;
      referral.tour = booking.tour;
      referral.referredUser = req.user.id;
      referral.commissionRate = commissionRate;
      referral.commissionAmount = commissionAmount;
      referral.bookingAmount = totalPrice;
      referral.bookedAt = new Date();
      referral.lockedAt = new Date();
      referral.status = "commission_locked";
      await referral.save();
    } else {
      // Create new referral record
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      await AffiliateReferral.create({
        affiliate: affiliate._id,
        visitorId: visitorId || crypto.randomBytes(16).toString("hex"),
        referredUser: req.user.id,
        booking: booking._id,
        tour: booking.tour,
        status: "commission_locked",
        commissionRate,
        commissionAmount,
        bookingAmount: totalPrice,
        source: "direct",
        clickedAt: new Date(),
        bookedAt: new Date(),
        lockedAt: new Date(),
        expiresAt: new Date(Date.now() + THIRTY_DAYS),
      });
    }

    // Update affiliate stats
    affiliate.stats.totalBookings += 1;
    affiliate.stats.totalRevenue += totalPrice;
    affiliate.stats.totalCommissionEarned += commissionAmount;
    if (affiliate.stats.totalClicks > 0) {
      affiliate.stats.conversionRate =
        (affiliate.stats.totalBookings / affiliate.stats.totalClicks) * 100;
    }

    // Check for tier upgrade
    affiliate.updateTier();
    await affiliate.save({ validateBeforeSave: false });

    // Send commission earned email
    try {
      const user = await User.findById(affiliate.user);
      if (user) {
        const {
          sendAffiliateCommissionEarnedEmail,
        } = require("../utils/emailService");
        await sendAffiliateCommissionEarnedEmail(user.email, {
          name: user.name,
          commissionAmount,
          bookingReference: booking.bookingReference,
          tourName: booking.tour?.name || "a tour",
          totalEarned: affiliate.stats.totalCommissionEarned,
          pendingPayout:
            affiliate.stats.totalCommissionEarned -
            affiliate.stats.totalCommissionPaid,
        });
      }
    } catch (err) {
      console.error(
        "Failed to send commission earned email:",
        err.message
      );
    }
  } catch (error) {
    // Don't let affiliate tracking errors break the booking flow
    console.error("Affiliate attribution error:", error.message);
  }
};

module.exports = {
  applyForAffiliate,
  getMyAffiliateProfile,
  getMyReferrals,
  getMyPayouts,
  trackReferralClick,
  getAllAffiliates,
  getAffiliateStats,
  getAffiliateById,
  approveAffiliate,
  rejectAffiliate,
  suspendAffiliate,
  updateCommissionRate,
  processAffiliatePayout,
  attributeBookingToAffiliate,
};
