const Tour = require("../models/Tour");
const Country = require("../models/Country");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const getAllTours = catchAsync(async (req, res, next) => {
  // Build query
  const features = new APIFeatures(Tour.find({ isActive: true }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const tours = await features.query.populate("country", "name slug");

  // Get total count for pagination
  const total = await Tour.countDocuments({ isActive: true });

  res.status(200).json({
    status: "success",
    results: tours.length,
    total,
    data: {
      tours,
    },
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let query = { isActive: true };

  // Check if the parameter is a valid ObjectId (24 character hex string)
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  if (isValidObjectId) {
    // If it's a valid ObjectId, check both _id and slug
    query.$or = [{ _id: id }, { slug: id }];
  } else {
    // If it's not a valid ObjectId, only check slug
    query.slug = id;
  }

  const tour = await Tour.findOne(query)
    .populate("country")
    .populate({
      path: "reviews",
      match: { isVisible: true, moderationStatus: "approved" },
      select: "rating title comment user createdAt wouldRecommend",
      populate: {
        path: "user",
        select: "name avatar",
      },
    });

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const getToursByCountry = catchAsync(async (req, res, next) => {
  // Find country first
  const country = await Country.findOne({
    $or: [{ _id: req.params.countryId }, { slug: req.params.countryId }],
  });

  if (!country) {
    return next(new AppError("No country found with that ID", 404));
  }

  // Build query for tours in this country
  const features = new APIFeatures(
    Tour.find({ country: country._id, isActive: true }),
    req.query,
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query.populate("country", "name slug");
  const total = await Tour.countDocuments({
    country: country._id,
    isActive: true,
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    total,
    country: {
      _id: country._id,
      name: country.name,
      slug: country.slug,
      description: country.description,
    },
    data: {
      tours,
    },
  });
});

const getFeaturedTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.find({ isFeatured: true, isActive: true })
    .sort("-ratingsAverage -ratingsQuantity")
    .limit(10)
    .populate("country", "name slug")
    .select(
      "name slug summary price ratingsAverage ratingsQuantity duration images",
    );

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

const getPopularTours = catchAsync(async (req, res, next) => {
  const tours = await Tour.getPopularTours(10);

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours,
    },
  });
});

const searchTours = catchAsync(async (req, res, next) => {
  const { q, country, duration, priceMin, priceMax, difficulty, travelStyle } =
    req.query;

  const query = { isActive: true };

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Country filter
  if (country) {
    const countryDoc = await Country.findOne({
      $or: [{ _id: country }, { slug: country }],
    });
    if (countryDoc) {
      query.country = countryDoc._id;
    }
  }

  // Duration filter
  if (duration) {
    const [min, max] = duration.split("-").map(Number);
    query["duration.days"] = { $gte: min, $lte: max };
  }

  // Price filter
  if (priceMin || priceMax) {
    query["price.amount"] = {};
    if (priceMin) query["price.amount"].$gte = Number(priceMin);
    if (priceMax) query["price.amount"].$lte = Number(priceMax);
  }

  // Difficulty filter
  if (difficulty) {
    query.difficulty = difficulty;
  }

  // Travel style filter
  if (travelStyle) {
    query.travelStyle = travelStyle;
  }

  const features = new APIFeatures(Tour.find(query), req.query)
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query.populate("country", "name slug");
  const total = await Tour.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: tours.length,
    total,
    data: {
      tours,
    },
  });
});

const checkTourAvailability = catchAsync(async (req, res, next) => {
  const { tourId, date } = req.params;

  const tour = await Tour.findById(tourId);
  if (!tour) {
    return next(new AppError("Tour not found", 404));
  }

  const availability = tour.checkAvailability(date);

  res.status(200).json({
    status: "success",
    data: {
      available: !!availability,
      availability,
    },
  });
});

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { isActive: true },
    },
    {
      $group: {
        _id: "$difficulty",
        numTours: { $sum: 1 },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price.amount" },
        minPrice: { $min: "$price.amount" },
        maxPrice: { $max: "$price.amount" },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});

// Admin only routes
const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      tour: newTour,
    },
  });
});

const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllTours,
  getTour,
  getToursByCountry,
  getFeaturedTours,
  getPopularTours,
  searchTours,
  checkTourAvailability,
  getTourStats,
  createTour,
  updateTour,
  deleteTour,
};
