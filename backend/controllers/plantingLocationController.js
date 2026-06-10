const PlantingLocation = require("../models/PlantingLocation");
const Tour = require("../models/Tour");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// GET all planting locations
const getAllPlantingLocations = catchAsync(async (req, res, next) => {
  let filter = { isActive: true };
  if (req.query.country) {
    filter.country = req.query.country;
  }

  const plantingLocations = await PlantingLocation.find(filter)
    .populate("country", "name slug destinations");

  res.status(200).json({
    status: "success",
    results: plantingLocations.length,
    data: {
      plantingLocations,
    },
  });
});

// GET single planting location
const getPlantingLocation = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);

  let query = { isActive: true };
  if (isValidObjectId) {
    query.$or = [{ _id: id }, { slug: id }];
  } else {
    query.slug = id;
  }

  const plantingLocation = await PlantingLocation.findOne(query)
    .populate("country", "name slug destinations");

  if (!plantingLocation) {
    return next(new AppError("No planting location found with that ID or slug", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      plantingLocation,
    },
  });
});

// CREATE planting location
const createPlantingLocation = catchAsync(async (req, res, next) => {
  const newLocation = await PlantingLocation.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      plantingLocation: newLocation,
    },
  });
});

// UPDATE planting location
const updatePlantingLocation = catchAsync(async (req, res, next) => {
  const updatedLocation = await PlantingLocation.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  ).populate("country", "name slug destinations");

  if (!updatedLocation) {
    return next(new AppError("No planting location found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      plantingLocation: updatedLocation,
    },
  });
});

// DELETE planting location
const deletePlantingLocation = catchAsync(async (req, res, next) => {
  // Check if any tour is using this planting location
  const associatedTours = await Tour.countDocuments({ plantingLocation: req.params.id });
  if (associatedTours > 0) {
    return next(
      new AppError(
        "Cannot delete planting location that is associated with active tours. Please remove it from those tours first.",
        400
      )
    );
  }

  const plantingLocation = await PlantingLocation.findByIdAndDelete(req.params.id);

  if (!plantingLocation) {
    return next(new AppError("No planting location found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllPlantingLocations,
  getPlantingLocation,
  createPlantingLocation,
  updatePlantingLocation,
  deletePlantingLocation,
};
