const PhysicalRating = require('../models/PhysicalRating');
const Tour = require('../models/Tour');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const getAllPhysicalRatings = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(PhysicalRating.find({ isActive: true }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const physicalRatings = await features.query.sort('level');

    res.status(200).json({
        status: 'success',
        results: physicalRatings.length,
        data: {
            physicalRatings,
        },
    });
});

const getPhysicalRating = catchAsync(async (req, res, next) => {
    const physicalRating = await PhysicalRating.findById(req.params.id);

    if (!physicalRating) {
        return next(new AppError('No physical rating found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            physicalRating,
        },
    });
});

const getPhysicalRatingBySlug = catchAsync(async (req, res, next) => {
    const physicalRating = await PhysicalRating.findOne({ slug: req.params.slug, isActive: true });

    if (!physicalRating) {
        return next(new AppError('No physical rating found with that slug', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            physicalRating,
        },
    });
});

const createPhysicalRating = catchAsync(async (req, res, next) => {
    const newPhysicalRating = await PhysicalRating.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            physicalRating: newPhysicalRating,
        },
    });
});

const updatePhysicalRating = catchAsync(async (req, res, next) => {
    const physicalRating = await PhysicalRating.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!physicalRating) {
        return next(new AppError('No physical rating found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            physicalRating,
        },
    });
});

const deletePhysicalRating = catchAsync(async (req, res, next) => {
    // Check if any tours are using this physical rating
    const toursUsingRating = await Tour.countDocuments({ physicalRating: req.params.id });

    if (toursUsingRating > 0) {
        return next(new AppError(`Cannot delete this physical rating. ${toursUsingRating} tour(s) are using it. Please reassign or delete those tours first.`, 400));
    }

    const physicalRating = await PhysicalRating.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!physicalRating) {
        return next(new AppError('No physical rating found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

module.exports = {
    getAllPhysicalRatings,
    getPhysicalRating,
    getPhysicalRatingBySlug,
    createPhysicalRating,
    updatePhysicalRating,
    deletePhysicalRating,
};
