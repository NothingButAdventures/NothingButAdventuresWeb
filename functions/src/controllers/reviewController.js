const Review = require('../models/Review');
const Booking = require('../models/Booking');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  
  // If tour ID is provided, filter reviews for that tour
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const features = new APIFeatures(
    Review.find(filter).find({ isVisible: true, moderationStatus: 'approved' }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query
    .populate('user', 'name avatar')
    .populate('tour', 'name slug')
    .populate('booking', 'bookingReference');

  const total = await Review.countDocuments({
    ...filter,
    isVisible: true,
    moderationStatus: 'approved',
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    total,
    data: {
      reviews,
    },
  });
});

const getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('user', 'name avatar')
    .populate('tour', 'name slug')
    .populate('booking', 'bookingReference');

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if user is authorized to view this review
  if (
    !review.isVisible &&
    req.user.role !== 'admin' &&
    review.user._id.toString() !== req.user.id
  ) {
    return next(new AppError('Review not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

const createReview = catchAsync(async (req, res, next) => {
  const { tour, booking, rating, title, comment, highlights, improvements, wouldRecommend, traveledWith, ageGroup } = req.body;

  // Check if booking exists and belongs to the user
  const userBooking = await Booking.findById(booking);
  if (!userBooking) {
    return next(new AppError('Booking not found', 404));
  }

  if (userBooking.user.toString() !== req.user.id) {
    return next(new AppError('You can only review your own bookings', 403));
  }

  if (userBooking.tour.toString() !== tour) {
    return next(new AppError('Booking does not match the tour', 400));
  }

  if (userBooking.status !== 'completed') {
    return next(new AppError('You can only review completed tours', 400));
  }

  // Check if user has already reviewed this tour
  const existingReview = await Review.findOne({
    user: req.user.id,
    tour,
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this tour', 400));
  }

  // Create review
  const newReview = await Review.create({
    tour,
    user: req.user.id,
    booking,
    rating,
    title,
    comment,
    highlights,
    improvements,
    wouldRecommend,
    traveledWith,
    ageGroup,
  });

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

const updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check if user can edit this review
  if (!review.canBeEditedBy(req.user.id)) {
    return next(
      new AppError('You can only edit your own reviews within 30 days of creation', 403)
    );
  }

  // Update review and reset moderation status
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      moderationStatus: 'pending',
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      review: updatedReview,
    },
  });
});

const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // Check authorization
  if (req.user.role !== 'admin' && review.user.toString() !== req.user.id) {
    return next(new AppError('You can only delete your own reviews', 403));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getTourReviewStats = catchAsync(async (req, res, next) => {
  const tourId = req.params.tourId;
  const stats = await Review.getReviewStats(tourId);

  if (!stats) {
    return res.status(200).json({
      status: 'success',
      data: {
        totalReviews: 0,
        averageRating: 0,
        recommendationRate: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

const voteHelpful = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpfulVotes: 1 } },
    { new: true }
  );

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

const reportReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { reportedCount: 1 } },
    { new: true }
  );

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  // If review gets too many reports, hide it
  if (review.reportedCount >= 5) {
    review.isVisible = false;
    review.moderationStatus = 'pending';
    await review.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'Review reported successfully',
  });
});

// Admin only routes
const moderateReview = catchAsync(async (req, res, next) => {
  const { moderationStatus, moderationNotes } = req.body;

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      moderationStatus,
      moderationNotes,
      isVisible: moderationStatus === 'approved',
    },
    { new: true }
  );

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

const addReviewResponse = catchAsync(async (req, res, next) => {
  const { message, authorType } = req.body;

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        responses: {
          author: req.user.id,
          authorType,
          message,
        },
      },
    },
    { new: true }
  ).populate('responses.author', 'name');

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

const getReviewStats = catchAsync(async (req, res, next) => {
  const stats = await Review.aggregate([
    {
      $group: {
        _id: '$moderationStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  const ratingStats = await Review.aggregate([
    { $match: { isVisible: true, moderationStatus: 'approved' } },
    {
      $group: {
        _id: null,
        totalReviews: { $sum: 1 },
        averageRating: { $avg: '$rating.overall' },
        totalHelpfulVotes: { $sum: '$helpfulVotes' },
        totalReports: { $sum: '$reportedCount' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      moderationStats: stats,
      overallStats: ratingStats[0] || {
        totalReviews: 0,
        averageRating: 0,
        totalHelpfulVotes: 0,
        totalReports: 0,
      },
    },
  });
});

module.exports = {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getTourReviewStats,
  voteHelpful,
  reportReview,
  moderateReview,
  addReviewResponse,
  getReviewStats,
};