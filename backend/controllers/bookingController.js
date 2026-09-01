const User = require('../models/User');
const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { checkAndApplyWalletRewards } = require('../utils/walletUtils');

const getAllBookings = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Booking.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bookings = await features.query
    .populate('tour', 'name slug duration price')
    .populate('user', 'name email');

  const total = await Booking.countDocuments();

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    total,
    data: {
      bookings,
    },
  });
});

const getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('tour')
    .populate('user', 'name email phone');

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Check if user is authorized to view this booking
  if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to view this booking', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

const createBooking = catchAsync(async (req, res, next) => {
  const { tour: tourId, startDate, travelers, specialRequests, lifetimeDepositCodes, paymentOption } = req.body;

  // Check if tour exists and is available
  const tour = await Tour.findById(tourId);
  if (!tour || !tour.isActive) {
    return next(new AppError('Tour not found or not available', 404));
  }

  // Check availability for the selected date
  const availability = tour.checkAvailability(startDate);
  if (!availability) {
    return next(new AppError('No availability for the selected date', 400));
  }

  if (availability.availableSpots < travelers.length) {
    return next(
      new AppError(
        `Only ${availability.availableSpots} spots available for this date`,
        400
      )
    );
  }

  // Use the price calculated on checkout (includes date-specific discounts, taxes included)
  const numberOfTravelers = travelers.length;
  const pricePerPerson = req.body.pricePerPerson || availability.price?.amount || tour.price.amount;
  const totalPrice = req.body.totalPrice || pricePerPerson * numberOfTravelers;

  // 1. Process Lifetime Deposits if provided
  let totalLifetimeDepositCredit = 0;
  let validatedDeposits = [];

  if (lifetimeDepositCodes && Array.isArray(lifetimeDepositCodes) && lifetimeDepositCodes.length > 0) {
    if (tour.exemptFromLifetimeDeposit) {
      return next(new AppError('This tour is exempt from Lifetime Deposits.', 400));
    }
    if (lifetimeDepositCodes.length > numberOfTravelers) {
      return next(new AppError('You cannot apply more Lifetime Deposits than the number of travelers.', 400));
    }

    const LifetimeDeposit = require('../models/LifetimeDeposit');
    for (const code of lifetimeDepositCodes) {
      const deposit = await LifetimeDeposit.findOne({ code: code.toUpperCase().trim() });
      if (!deposit) {
        return next(new AppError(`Invalid Lifetime Deposit code: ${code}`, 404));
      }
      if (deposit.user.toString() !== req.user.id) {
        return next(new AppError(`You are not authorized to use the Lifetime Deposit code: ${code}`, 403));
      }
      if (deposit.status !== 'active') {
        return next(new AppError(`Lifetime Deposit ${code} is already ${deposit.status}`, 400));
      }
      validatedDeposits.push(deposit);
    }

    // Apply deposits. Each deposit can apply to a traveler
    for (let i = 0; i < validatedDeposits.length; i++) {
      const dep = validatedDeposits[i];
      // Credit is capped at the traveler's price contribution (basePrice)
      const credit = Math.min(dep.amount, pricePerPerson);
      totalLifetimeDepositCredit += credit;
    }
  }

  // Calculate pricing after deposit credit
  const remainingTotalPrice = Math.max(0, totalPrice - totalLifetimeDepositCredit);

  // Determine required deposit payment to check for $0 cash down
  const percentage = tour.price.bookingPercentage || 20;
  const depPerPerson = tour.price.bookingType === 'Amount' ? (tour.price.bookingAmount || 0) : Math.round(tour.price.amount * (percentage / 100));
  const totalRequiredDeposit = depPerPerson * numberOfTravelers;

  // Calculate covered deposit credit
  let coveredDeposit = 0;
  for (const dep of validatedDeposits) {
    coveredDeposit += Math.min(dep.amount, depPerPerson);
  }
  const cashRequiredUpfront = Math.max(0, totalRequiredDeposit - coveredDeposit);

  // Set up initial payment structure
  const paymentData = req.body.payment || {
    method: 'pending',
    status: 'pending',
    transactions: [],
  };

  let bookingStatus = 'pending';

  // If upfront deposit or full price is covered completely by Lifetime Deposit
  if (cashRequiredUpfront === 0 && paymentOption === 'deposit') {
    bookingStatus = 'confirmed';
    paymentData.status = 'partially_paid';
    paymentData.method = 'lifetime_deposit';
    paymentData.transactions.push({
      transactionId: `LTD-DEP-${Date.now()}`,
      amount: totalLifetimeDepositCredit,
      currency: tour.price.currency,
      status: 'completed',
      paymentDate: new Date(),
      gateway: 'lifetime_deposit',
      gatewayResponse: { appliedCodes: lifetimeDepositCodes },
    });
  } else if (remainingTotalPrice === 0 && paymentOption === 'full') {
    bookingStatus = 'confirmed';
    paymentData.status = 'paid';
    paymentData.method = 'lifetime_deposit';
    paymentData.transactions.push({
      transactionId: `LTD-FULL-${Date.now()}`,
      amount: totalLifetimeDepositCredit,
      currency: tour.price.currency,
      status: 'completed',
      paymentDate: new Date(),
      gateway: 'lifetime_deposit',
      gatewayResponse: { appliedCodes: lifetimeDepositCodes },
    });
  }

  // Create booking
  const bookingData = {
    tour: tourId,
    user: req.user.id,
    startDate,
    travelers,
    numberOfTravelers,
    price: {
      basePrice: pricePerPerson,
      discountAmount: 0,
      taxes: 0,
      totalPrice: remainingTotalPrice,
      currency: tour.price.currency,
    },
    extras: req.body.extras || { activities: [], accommodationUpgrade: null },
    specialRequests,
    status: bookingStatus,
    payment: {
      ...paymentData,
      lifetimeDepositApplied: totalLifetimeDepositCredit,
      lifetimeDepositCodes: lifetimeDepositCodes || [],
    },
  };

  const newBooking = await Booking.create(bookingData);

  // Update Lifetime Deposits status to used in DB
  if (validatedDeposits.length > 0) {
    const LifetimeDeposit = require('../models/LifetimeDeposit');
    await LifetimeDeposit.updateMany(
      { _id: { $in: validatedDeposits.map(d => d._id) } },
      {
        status: 'used',
        usedInBooking: newBooking._id,
        usedAt: new Date(),
      }
    );
  }

  // Update tour availability
  const tourStartDate = tour.startDates.id(availability._id);
  tourStartDate.availableSpots -= numberOfTravelers;
  await tour.save({ validateBeforeSave: false });

  // Send confirmation email if booking is confirmed immediately (fully covered by Lifetime Deposit)
  if (newBooking.status === 'confirmed') {
    newBooking.sendConfirmationEmail();
  }

  // Mark abandoned checkout as completed
  try {
    const AbandonedCheckout = require('../models/AbandonedCheckout');
    await AbandonedCheckout.updateMany(
      { user: req.user.id, tour: tourId, startDate: new Date(startDate), status: 'pending' },
      { status: 'completed' }
    );
  } catch (err) {
    console.error('Failed to update abandoned checkout status:', err.message);
  }

  // Attribute booking to affiliate if referral cookie is present
  try {
    const { attributeBookingToAffiliate } = require('../controllers/affiliateController');
    await attributeBookingToAffiliate(req, newBooking, remainingTotalPrice || totalPrice);
  } catch (err) {
    console.error('Failed to attribute booking to affiliate:', err.message);
  }

  res.status(201).json({
    status: 'success',
    data: {
      booking: newBooking,
    },
  });
});

const updateBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Check authorization
  if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to update this booking', 403));
  }

  // Prevent updating certain fields after booking is confirmed
  if (booking.status === 'confirmed' && req.body.startDate) {
    return next(
      new AppError('Cannot change start date for confirmed bookings', 400)
    );
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).populate('tour user');

  if (req.body.status === 'completed') {
    await checkAndApplyWalletRewards(updatedBooking.user._id);
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking: updatedBooking,
    },
  });
});

const getCancellationPreview = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('tour');

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Check authorization
  if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to preview this cancellation', 403));
  }

  if (booking.status === 'cancelled') {
    return next(new AppError('Booking is already cancelled', 400));
  }

  const tour = booking.tour;
  const isExempt = tour ? tour.exemptFromLifetimeDeposit : false;

  const now = new Date();
  const startDate = new Date(booking.startDate);
  const timeDifference = startDate.getTime() - now.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  // Calculate total paid including applied Lifetime Deposits but filtering out completed LTD transactions to prevent double counting
  const cashPaid = booking.payment.transactions.reduce(
    (sum, tx) => (tx.status === 'completed' && tx.gateway !== 'lifetime_deposit' ? sum + tx.amount : sum),
    0
  );
  const totalPaid = cashPaid + (booking.payment.lifetimeDepositApplied || 0);

  // Calculate deposit requirements
  let depositPerPerson = 200; // default fallback if tour or price is missing
  if (tour && tour.price) {
    if (tour.price.bookingType === 'Amount' && tour.price.bookingAmount) {
      depositPerPerson = tour.price.bookingAmount;
    } else {
      const percentage = tour.price.bookingPercentage || 20;
      depositPerPerson = Math.round(tour.price.amount * (percentage / 100));
    }
  }

  const totalRequiredDeposit = depositPerPerson * booking.numberOfTravelers;
  const heldDepositAmount = isExempt ? 0 : Math.min(totalPaid, totalRequiredDeposit);
  const remainder = Math.max(0, totalPaid - heldDepositAmount);

  let refundPercentage = 0;
  let policyApplied = '';

  if (daysDifference >= 60) {
    refundPercentage = 1;
    policyApplied = 'Scenario A (60+ days before departure): Lifetime Deposit is held, the remaining payments are fully refunded.';
  } else if (daysDifference >= 30) {
    refundPercentage = 0.5;
    policyApplied = 'Scenario B (30-59 days before departure): Lifetime Deposit is held, 50% of the remaining payments are refunded.';
  } else {
    refundPercentage = 0;
    policyApplied = 'Scenario C (< 30 days before departure): Lifetime Deposit is held, no further refund is payable.';
  }

  const computedRefund = remainder * refundPercentage;
  const cashRefund = Math.min(computedRefund, cashPaid);
  const ltdRefund = computedRefund - cashRefund;
  const totalIssuedLtd = heldDepositAmount + ltdRefund;

  res.status(200).json({
    status: 'success',
    data: {
      bookingId: booking._id,
      daysBeforeDeparture: daysDifference,
      totalPaid,
      totalDepositAmount: totalRequiredDeposit,
      heldDepositAmount: isExempt ? 0 : totalIssuedLtd,
      refundAmount: cashRefund,
      policyApplied,
      isExempt,
    },
  });
});

const cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id).populate('tour');

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Check authorization
  if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to cancel this booking', 403));
  }

  if (booking.status === 'cancelled') {
    return next(new AppError('Booking is already cancelled', 400));
  }

  const tour = booking.tour;
  const isExempt = tour ? tour.exemptFromLifetimeDeposit : false;

  const now = new Date();
  const startDate = new Date(booking.startDate);
  const timeDifference = startDate.getTime() - now.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  // Calculate total paid including applied Lifetime Deposits but filtering out completed LTD transactions to prevent double counting
  const cashPaid = booking.payment.transactions.reduce(
    (sum, tx) => (tx.status === 'completed' && tx.gateway !== 'lifetime_deposit' ? sum + tx.amount : sum),
    0
  );
  const totalPaid = cashPaid + (booking.payment.lifetimeDepositApplied || 0);

  // Calculate deposit requirements
  let depositPerPerson = 200; // default fallback if tour or price is missing
  if (tour && tour.price) {
    if (tour.price.bookingType === 'Amount' && tour.price.bookingAmount) {
      depositPerPerson = tour.price.bookingAmount;
    } else {
      const percentage = tour.price.bookingPercentage || 20;
      depositPerPerson = Math.round(tour.price.amount * (percentage / 100));
    }
  }

  const totalRequiredDeposit = depositPerPerson * booking.numberOfTravelers;
  const heldDepositAmount = isExempt ? 0 : Math.min(totalPaid, totalRequiredDeposit);
  const remainder = Math.max(0, totalPaid - heldDepositAmount);

  let refundPercentage = 0;
  let policyApplied = '';

  if (daysDifference >= 60) {
    refundPercentage = 1;
    policyApplied = 'Scenario A';
  } else if (daysDifference >= 30) {
    refundPercentage = 0.5;
    policyApplied = 'Scenario B';
  } else {
    refundPercentage = 0;
    policyApplied = 'Scenario C';
  }

  const computedRefund = remainder * refundPercentage;
  const cashRefund = Math.min(computedRefund, cashPaid);
  const ltdRefund = computedRefund - cashRefund;
  const totalIssuedLtd = heldDepositAmount + ltdRefund;

  // If the booking had used Lifetime Deposit, cancel those old Lifetime Deposits
  if (booking.payment.lifetimeDepositCodes && booking.payment.lifetimeDepositCodes.length > 0) {
    const LifetimeDeposit = require('../models/LifetimeDeposit');
    await LifetimeDeposit.updateMany(
      { code: { $in: booking.payment.lifetimeDepositCodes } },
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: `Re-cancellation of booking ${booking.bookingReference}`,
      }
    );
  }

  // Issue Lifetime Deposits for the travelers if tour is not exempt and there is held deposit
  const issuedDeposits = [];
  if (!isExempt && totalIssuedLtd > 0) {
    const LifetimeDeposit = require('../models/LifetimeDeposit');
    const amountPerPerson = Math.round((totalIssuedLtd / booking.numberOfTravelers) * 100) / 100;

    for (let i = 0; i < booking.numberOfTravelers; i++) {
      const traveler = booking.travelers[i] || { firstName: 'Guest', lastName: `${i + 1}` };
      const travelerName = `${traveler.firstName} ${traveler.lastName}`.trim();

      // Generate unique LTD code: LTD-XXXX-XXXX
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const timePart = Date.now().toString(36).substring(3, 7).toUpperCase();
      const ltdCode = `LTD-${timePart}-${randomPart}`;

      const ltd = await LifetimeDeposit.create({
        code: ltdCode,
        user: booking.user,
        travelerName,
        amount: amountPerPerson,
        originalBooking: booking._id,
        originalTour: tour._id,
        status: 'active',
      });
      issuedDeposits.push(ltd);
    }
  }

  // Cancel active PayPal subscriptions if it's an installment plan
  if (booking.installmentPlan?.isActive && booking.installmentPlan?.subscriptionId) {
    try {
      const authString = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
      const authResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authString}`,
        },
        body: 'grant_type=client_credentials',
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        const accessToken = authData.access_token;
        const PAYPAL_BASE = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

        await fetch(
          `${PAYPAL_BASE}/v1/billing/subscriptions/${booking.installmentPlan.subscriptionId}/cancel`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ reason: 'Participant initiated booking cancellation' }),
          }
        );
      }
    } catch (err) {
      console.error('Failed to cancel PayPal subscription during manual cancel:', err.message);
    }
    booking.installmentPlan.isActive = false;
  }

  // Update booking
  booking.status = 'cancelled';
  booking.cancellation = {
    isCancelled: true,
    cancelledAt: new Date(),
    cancelledBy: req.user.id,
    reason: req.body.reason || 'Cancelled by user',
    refundAmount: cashRefund,
    refundStatus: cashRefund > 0 ? 'pending' : 'processed',
    issuedLifetimeDeposits: issuedDeposits.map(d => ({
      code: d.code,
      amount: d.amount,
      travelerName: d.travelerName,
    })),
  };

  await booking.save({ validateBeforeSave: false });

  // Restore tour availability
  if (tour) {
    const startDateEntry = tour.startDates.find(
      (sd) => sd.startDate.toDateString() === booking.startDate.toDateString()
    );
    if (startDateEntry) {
      startDateEntry.availableSpots += booking.numberOfTravelers;
      await tour.save({ validateBeforeSave: false });
    }
  }

  // Send Emails
  try {
    const User = require('../models/User');
    const bookingUser = await User.findById(booking.user);
    if (bookingUser && bookingUser.email) {
      const { sendCancellationSuccessEmail, sendLifetimeDepositIssuedEmail } = require('../utils/emailService');

      // Send cancellation confirmation email
      await sendCancellationSuccessEmail(bookingUser.email, {
        bookingReference: booking.bookingReference,
        tourName: tour ? tour.name : 'Your Tour',
        refundAmount: cashRefund,
        currency: booking.price.currency,
        policyApplied,
      });

      // Send emails for each issued Lifetime Deposit
      for (const ltd of issuedDeposits) {
        await sendLifetimeDepositIssuedEmail(bookingUser.email, {
          travelerName: ltd.travelerName,
          code: ltd.code,
          amount: ltd.amount,
          currency: booking.price.currency,
          tourName: tour ? tour.name : 'Cancelled Tour',
        });
      }
    }
  } catch (err) {
    console.error('Failed to send cancellation emails:', err.message);
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
      refundAmount: cashRefund,
      issuedLifetimeDeposits: issuedDeposits.map(d => ({ code: d.code, amount: d.amount })),
    },
  });
});

const confirmBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (booking.payment.status !== 'paid') {
    return next(new AppError('Payment must be completed before confirming booking', 400));
  }

  booking.status = 'confirmed';
  await booking.save();

  // Send confirmation email
  booking.sendConfirmationEmail();

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

const getBookingStats = catchAsync(async (req, res, next) => {
  const stats = await Booking.getBookingStats();

  const statusStats = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$price.totalPrice' },
      },
    },
  ]);

  const monthlyStats = await Booking.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        bookings: { $sum: 1 },
        revenue: { $sum: '$price.totalPrice' },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overallStats: stats,
      statusStats,
      monthlyStats,
    },
  });
});

const capturePayPalPayment = catchAsync(async (req, res, next) => {
  const { orderId, paymentOption } = req.body;
  const bookingId = req.params.id;

  if (!orderId) {
    return next(new AppError('Please provide a PayPal order ID', 400));
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  if (req.user.role !== 'admin' && booking.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to update this booking', 403));
  }

  // 1. Authorize with PayPal
  const authString = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64');
  const authResponse = await fetch('https://api-m.sandbox.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${authString}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!authResponse.ok) {
    console.error("PayPal Auth Error", await authResponse.text());
    return next(new AppError('Failed to authenticate with PayPal', 500));
  }

  const authData = await authResponse.json();
  const accessToken = authData.access_token;

  // 2. Capture the order
  const captureResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const captureData = await captureResponse.json();

  if (!captureResponse.ok || captureData.status !== 'COMPLETED') {
    console.error("PayPal Capture Error", captureData);
    return next(new AppError('Payment capture failed', 400));
  }

  // 3. Update booking status
  const captureItem = captureData.purchase_units[0].payments.captures[0];
  const capturedAmount = parseFloat(captureItem.amount.value);

  booking.payment = {
    method: 'paypal',
    status: paymentOption === 'deposit' ? 'partially_paid' : 'paid',
    transactions: [
      ...(booking.payment.transactions || []),
      {
        transactionId: captureItem.id,
        amount: capturedAmount,
        currency: captureItem.amount.currency_code,
        status: 'completed',
        paymentDate: new Date(),
        gateway: 'paypal',
        gatewayResponse: captureData,
      },
    ],
    lifetimeDepositApplied: booking.payment.lifetimeDepositApplied || 0,
    lifetimeDepositCodes: booking.payment.lifetimeDepositCodes || [],
  };

  await booking.save();

  // Send confirmation email
  booking.sendConfirmationEmail();

  // Mark abandoned checkout as completed
  try {
    const AbandonedCheckout = require('../models/AbandonedCheckout');
    await AbandonedCheckout.updateMany(
      { user: booking.user, tour: booking.tour, startDate: booking.startDate, status: 'pending' },
      { status: 'completed' }
    );
  } catch (err) {
    console.error('Failed to update abandoned checkout status:', err.message);
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

const trackCheckoutStart = catchAsync(async (req, res, next) => {
  const { tour: tourId, startDate } = req.body;

  if (!tourId || !startDate) {
    return next(new AppError('Tour ID and start date are required to track checkout', 400));
  }

  const AbandonedCheckout = require('../models/AbandonedCheckout');

  // Create or update checkout session to avoid duplicates
  let checkout = await AbandonedCheckout.findOne({
    user: req.user.id,
    tour: tourId,
    startDate: new Date(startDate),
    status: 'pending',
  });

  if (!checkout) {
    checkout = await AbandonedCheckout.create({
      user: req.user.id,
      tour: tourId,
      startDate: new Date(startDate),
      status: 'pending',
    });
  } else {
    // Update timestamp to delay recovery email window if they reload checkout
    checkout.createdAt = new Date();
    await checkout.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: 'success',
    data: {
      checkout,
    },
  });
});

const checkAbandonedCheckouts = async () => {
  try {
    const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const AbandonedCheckout = require('../models/AbandonedCheckout');
    const { sendAbandonedCheckoutEmail } = require('../utils/emailService');

    // Find pending checkouts created between 24 hours ago and 1 hour ago that haven't received emails yet
    const pendingCheckouts = await AbandonedCheckout.find({
      status: 'pending',
      emailSent: false,
      createdAt: { $gte: twentyFourHoursAgo, $lte: oneHourAgo },
    }).populate('user').populate('tour');

    for (const checkout of pendingCheckouts) {
      if (checkout.user && checkout.tour) {
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const formattedDate = new Date(checkout.startDate).toISOString().split('T')[0];
        const checkoutUrl = `${clientUrl}/trips/${checkout.tour.slug}/${checkout.tour.tourCode}/checkout?date=${formattedDate}`;

        await sendAbandonedCheckoutEmail(checkout.user.email, {
          name: checkout.user.name,
          tourName: checkout.tour.name,
          duration: checkout.tour.duration,
          price: checkout.tour.price.amount,
          currency: checkout.tour.price.currency,
          startDate: checkout.startDate,
          checkoutUrl,
        });
      }
      checkout.emailSent = true;
      await checkout.save({ validateBeforeSave: false });
    }
  } catch (err) {
    console.error('Error checking abandoned checkouts:', err.message);
  }
};

const submitTravelerDocuments = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  // Only the booking owner can submit documents
  if (booking.user.toString() !== req.user.id) {
    return next(new AppError('You are not authorized to submit documents for this booking', 403));
  }

  const { travelerDocuments } = req.body;

  if (!travelerDocuments || !Array.isArray(travelerDocuments)) {
    return next(new AppError('Please provide traveler documents', 400));
  }

  // Validate that documents are provided for all travelers
  if (travelerDocuments.length !== booking.numberOfTravelers) {
    return next(new AppError(`Documents must be provided for all ${booking.numberOfTravelers} travelers`, 400));
  }

  const docTypes = ['passport', 'visa', 'medicalCertificate', 'insurance'];

  for (let i = 0; i < travelerDocuments.length; i++) {
    const doc = travelerDocuments[i];
    for (const docType of docTypes) {
      if (!doc[docType] || !doc[docType].url || !doc[docType].fileName) {
        return next(new AppError(`Missing ${docType} document for traveler ${i + 1}`, 400));
      }
    }
  }

  // Build the travelerDocuments array for the booking
  const formattedDocs = travelerDocuments.map((doc, index) => {
    const existing = booking.travelerDocuments?.find(d => d.travelerIndex === index);

    const processDocField = (docType) => {
      const existingDoc = existing?.[docType];
      if (existingDoc && existingDoc.verified) {
        // If already verified by admin, preserve the existing verified document
        return {
          url: existingDoc.url,
          fileName: existingDoc.fileName,
          uploadedAt: existingDoc.uploadedAt || new Date(),
          verified: true,
        };
      }
      return {
        url: doc[docType].url,
        fileName: doc[docType].fileName,
        uploadedAt: new Date(),
        verified: false,
      };
    };

    return {
      travelerIndex: index,
      passport: processDocField('passport'),
      visa: processDocField('visa'),
      medicalCertificate: processDocField('medicalCertificate'),
      insurance: processDocField('insurance'),
      submittedAt: new Date(),
    };
  });

  booking.travelerDocuments = formattedDocs;
  booking.documentsSubmitted = true;

  // Recompute documentsVerified
  const allVerified = formattedDocs.every(doc =>
    doc.passport.verified && doc.visa.verified && doc.medicalCertificate.verified && doc.insurance.verified
  );
  booking.documentsVerified = allVerified;

  await booking.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

const toggleDocumentVerification = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  const { travelerIndex, docType } = req.body;

  if (travelerIndex === undefined || travelerIndex === null) {
    return next(new AppError('Please provide travelerIndex', 400));
  }

  const validDocTypes = ['passport', 'visa', 'medicalCertificate', 'insurance'];
  if (!validDocTypes.includes(docType)) {
    return next(new AppError('Invalid document type. Must be one of: passport, visa, medicalCertificate, insurance', 400));
  }

  if (!booking.travelerDocuments || booking.travelerDocuments.length === 0) {
    return next(new AppError('No documents have been submitted for this booking', 400));
  }

  const docEntry = booking.travelerDocuments.find(d => d.travelerIndex === travelerIndex);
  if (!docEntry) {
    return next(new AppError(`No documents found for traveler index ${travelerIndex}`, 404));
  }

  if (!docEntry[docType] || !docEntry[docType].url) {
    return next(new AppError(`No ${docType} document found for this traveler`, 404));
  }

  // Toggle the verified status
  docEntry[docType].verified = !docEntry[docType].verified;

  // Recompute overall documentsVerified
  const allVerified = booking.travelerDocuments.every(doc =>
    doc.passport?.verified && doc.visa?.verified && doc.medicalCertificate?.verified && doc.insurance?.verified
  );
  booking.documentsVerified = allVerified;

  await booking.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

module.exports = {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  getBookingStats,
  capturePayPalPayment,
  getCancellationPreview,
  trackCheckoutStart,
  checkAbandonedCheckouts,
  submitTravelerDocuments,
  toggleDocumentVerification,
};