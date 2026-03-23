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
  const { tour: tourId, startDate, travelers, specialRequests } = req.body;

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
      totalPrice: totalPrice,
      currency: tour.price.currency,
    },
    extras: req.body.extras || { activities: [], accommodationUpgrade: null },
    specialRequests,
    payment: req.body.payment || {
      method: 'pending',
      status: 'pending',
      transactions: [],
    },
  };

  const newBooking = await Booking.create(bookingData);

  // Update tour availability
  const tourStartDate = tour.startDates.id(availability._id);
  tourStartDate.availableSpots -= numberOfTravelers;
  await tour.save({ validateBeforeSave: false });

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

const cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

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

  // Calculate refund amount
  const refundAmount = booking.calculateRefund();

  // Update booking
  booking.status = 'cancelled';
  booking.cancellation = {
    isCancelled: true,
    cancelledAt: new Date(),
    cancelledBy: req.user.id,
    reason: req.body.reason || 'Cancelled by user',
    refundAmount,
    refundStatus: 'pending',
  };

  await booking.save();

  // Restore tour availability
  const tour = await Tour.findById(booking.tour);
  const startDate = tour.startDates.find(
    (sd) => sd.startDate.toDateString() === booking.startDate.toDateString()
  );
  if (startDate) {
    startDate.availableSpots += booking.numberOfTravelers;
    await tour.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
      refundAmount,
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

module.exports = {
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  getBookingStats,
};