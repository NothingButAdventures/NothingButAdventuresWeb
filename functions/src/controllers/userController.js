const User = require('../models/User');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const updateMe = catchAsync(async (req, res, next) => {
  // Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /update-password.',
        400
      )
    );
  }

  // Filter out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'name',
    'email',
    'phone',
    'dateOfBirth',
    'nationality',
    'preferences'
  );

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getMyBookings = catchAsync(async (req, res, next) => {
  const Booking = require('../models/Booking');
  
  const features = new APIFeatures(
    Booking.find({ user: req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bookings = await features.query
    .populate('tour', 'name slug images price duration')
    .populate('user', 'name email');

  const total = await Booking.countDocuments({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    total,
    data: {
      bookings,
    },
  });
});

const getMyReviews = catchAsync(async (req, res, next) => {
  const Review = require('../models/Review');
  
  const features = new APIFeatures(
    Review.find({ user: req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query
    .populate('tour', 'name slug images')
    .populate('booking', 'bookingReference startDate');

  const total = await Review.countDocuments({ user: req.user.id });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    data: {
      reviews,
    },
  });
});

// Admin only functions
const getAllUsers = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  const total = await User.countDocuments();

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    data: {
      users,
    },
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getUserStats = catchAsync(async (req, res, next) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalUsers = await User.countDocuments({ isActive: true });
  const totalBookings = await require('../models/Booking').countDocuments();
  const totalReviews = await require('../models/Review').countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      usersByRole: stats,
      totalUsers,
      totalBookings,
      totalReviews,
    },
  });
});

module.exports = {
  updateMe,
  deleteMe,
  getMyBookings,
  getMyReviews,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserStats,
};