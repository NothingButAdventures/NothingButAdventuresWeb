const Hotel = require("../models/Hotel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const getAllHotels = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Hotel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const hotels = await features.query
    .populate("destination", "name slug");

  const total = await Hotel.countDocuments();

  res.status(200).json({
    status: "success",
    results: hotels.length,
    total,
    data: {
      hotels,
    },
  });
});

const getHotel = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id)
    .populate("destination");

  if (!hotel) {
    return next(new AppError("No hotel found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      hotel,
    },
  });
});

const createHotel = catchAsync(async (req, res, next) => {
  const newHotel = await Hotel.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      hotel: newHotel,
    },
  });
});

const updateHotel = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!hotel) {
    return next(new AppError("No hotel found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      hotel,
    },
  });
});

const deleteHotel = catchAsync(async (req, res, next) => {
  const hotel = await Hotel.findByIdAndDelete(req.params.id);

  if (!hotel) {
    return next(new AppError("No hotel found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
};
