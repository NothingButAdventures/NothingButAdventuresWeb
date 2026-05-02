const Activity = require("../models/Activity");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

const getAllActivities = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Activity.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const activities = await features.query
    .populate("destination", "name slug")
    .populate("travelStyles", "name")
    .populate("physicalRating", "name level");

  const total = await Activity.countDocuments();

  res.status(200).json({
    status: "success",
    results: activities.length,
    total,
    data: {
      activities,
    },
  });
});

const getActivity = catchAsync(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id)
    .populate("destination")
    .populate("travelStyles")
    .populate("physicalRating");

  if (!activity) {
    return next(new AppError("No activity found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      activity,
    },
  });
});

const createActivity = catchAsync(async (req, res, next) => {
  const newActivity = await Activity.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      activity: newActivity,
    },
  });
});

const updateActivity = catchAsync(async (req, res, next) => {
  const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!activity) {
    return next(new AppError("No activity found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      activity,
    },
  });
});

const deleteActivity = catchAsync(async (req, res, next) => {
  const activity = await Activity.findByIdAndDelete(req.params.id);

  if (!activity) {
    return next(new AppError("No activity found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
};
