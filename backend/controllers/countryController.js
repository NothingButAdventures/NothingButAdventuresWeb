const mongoose = require('mongoose');
const Country = require('../models/Country');
const Continent = require('../models/Continent');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getAllCountries = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Country.find({ isActive: true }), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const countries = await features.query;
  const total = await Country.countDocuments({ isActive: true });

  res.status(200).json({
    status: 'success',
    results: countries.length,
    total,
    data: {
      countries,
    },
  });
});

const getCountry = catchAsync(async (req, res, next) => {
  const country = await Country.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
    isActive: true,
  }).populate({
    path: 'tours',
    match: { isActive: true },
    select: 'name slug summary price ratingsAverage ratingsQuantity duration images',
  });

  if (!country) {
    return next(new AppError('No country found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      country,
    },
  });
});

const getPopularCountries = catchAsync(async (req, res, next) => {
  const countries = await Country.find({ isActive: true })
    .sort('-statistics.popularityScore -statistics.totalTours')
    .limit(10)
    .select('name slug shortDescription images statistics');

  res.status(200).json({
    status: 'success',
    results: countries.length,
    data: {
      countries,
    },
  });
});

const getCountriesByContinent = catchAsync(async (req, res, next) => {
  const { continent } = req.params;
  let filter = { isActive: true };

  if (mongoose.Types.ObjectId.isValid(continent)) {
    filter.continent = continent;
  } else {
    const continentDoc = await Continent.findOne({
      $or: [
        { name: { $regex: new RegExp(continent, 'i') } },
        { slug: continent }
      ]
    });

    if (continentDoc) {
      filter.continent = continentDoc._id;
    } else {
      return res.status(200).json({
        status: 'success',
        results: 0,
        continent,
        data: { countries: [] }
      });
    }
  }

  const countries = await Country.find(filter)
    .sort('name')
    .select('name slug shortDescription images statistics');

  res.status(200).json({
    status: 'success',
    results: countries.length,
    continent,
    data: {
      countries,
    },
  });
});

const searchCountries = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  const query = { isActive: true };

  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { shortDescription: { $regex: q, $options: 'i' } },
    ];
  }

  const countries = await Country.find(query)
    .sort('name')
    .select('name slug shortDescription images statistics');

  res.status(200).json({
    status: 'success',
    results: countries.length,
    data: {
      countries,
    },
  });
});

const getCountryStats = catchAsync(async (req, res, next) => {
  const stats = await Country.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$continent',
        numCountries: { $sum: 1 },
        totalTours: { $sum: '$statistics.totalTours' },
        avgRating: { $avg: '$statistics.averageRating' },
      },
    },
    { $sort: { numCountries: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

// Admin only routes
const createCountry = catchAsync(async (req, res, next) => {
  const newCountry = await Country.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      country: newCountry,
    },
  });
});

const updateCountry = catchAsync(async (req, res, next) => {
  const country = await Country.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!country) {
    return next(new AppError('No country found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      country,
    },
  });
});

const deleteCountry = catchAsync(async (req, res, next) => {
  const country = await Country.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!country) {
    return next(new AppError('No country found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

module.exports = {
  getAllCountries,
  getCountry,
  getPopularCountries,
  getCountriesByContinent,
  searchCountries,
  getCountryStats,
  createCountry,
  updateCountry,
  deleteCountry,
};