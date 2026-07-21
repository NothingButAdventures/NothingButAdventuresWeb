const LifetimeDeposit = require("../models/LifetimeDeposit");
const Tour = require("../models/Tour");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

/**
 * Get all Lifetime Deposits for the logged-in user
 */
const getMyLifetimeDeposits = catchAsync(async (req, res, next) => {
  const deposits = await LifetimeDeposit.find({ user: req.user.id })
    .populate("originalTour", "name slug tourCode")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: deposits.length,
    data: {
      deposits,
    },
  });
});

/**
 * Validate a Lifetime Deposit code
 */
const validateLifetimeDeposit = catchAsync(async (req, res, next) => {
  const { code, tourId } = req.body;

  if (!code) {
    return next(new AppError("Please provide a Lifetime Deposit code", 400));
  }

  // Find the deposit
  const deposit = await LifetimeDeposit.findOne({
    code: code.toUpperCase().trim(),
  });

  if (!deposit) {
    return next(new AppError("Invalid Lifetime Deposit code. Please check and try again.", 404));
  }

  // Check ownership
  if (deposit.user.toString() !== req.user.id) {
    return next(new AppError("You are not authorized to use this Lifetime Deposit code.", 403));
  }

  // Check status
  if (deposit.status !== "active") {
    return next(
      new AppError(
        `This Lifetime Deposit code is already ${deposit.status}. It cannot be applied.`,
        400
      )
    );
  }

  // Check tour exemption if tourId is provided
  if (tourId) {
    const tour = await Tour.findById(tourId);
    if (tour && tour.exemptFromLifetimeDeposit) {
      return next(
        new AppError(
          `This tour ("${tour.name}") is exempt from Lifetime Deposits.`,
          400
        )
      );
    }
  }

  res.status(200).json({
    status: "success",
    data: {
      valid: true,
      deposit: {
        code: deposit.code,
        amount: deposit.amount,
        travelerName: deposit.travelerName,
      },
    },
  });
});

module.exports = {
  getMyLifetimeDeposits,
  validateLifetimeDeposit,
};
