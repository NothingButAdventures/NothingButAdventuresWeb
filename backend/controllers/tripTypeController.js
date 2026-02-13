const TripType = require('../models/TripType');
const Tour = require('../models/Tour');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const getAllTripTypes = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(TripType.find({ isActive: true }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const tripTypes = await features.query;

    res.status(200).json({
        status: 'success',
        results: tripTypes.length,
        data: {
            tripTypes,
        },
    });
});

const getTripType = catchAsync(async (req, res, next) => {
    const tripType = await TripType.findById(req.params.id);

    if (!tripType) {
        return next(new AppError('No trip type found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tripType,
        },
    });
});

const getTripTypeBySlug = catchAsync(async (req, res, next) => {
    const tripType = await TripType.findOne({ slug: req.params.slug, isActive: true });

    if (!tripType) {
        return next(new AppError('No trip type found with that slug', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tripType,
        },
    });
});

const createTripType = catchAsync(async (req, res, next) => {
    const newTripType = await TripType.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tripType: newTripType,
        },
    });
});

const updateTripType = catchAsync(async (req, res, next) => {
    const tripType = await TripType.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!tripType) {
        return next(new AppError('No trip type found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            tripType,
        },
    });
});

const deleteTripType = catchAsync(async (req, res, next) => {
    // Check if any tours are using this trip type
    const toursUsingType = await Tour.countDocuments({ tripType: req.params.id });

    if (toursUsingType > 0) {
        return next(new AppError(`Cannot delete this trip type. ${toursUsingType} tour(s) are using it. Please reassign or delete those tours first.`, 400));
    }

    const tripType = await TripType.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!tripType) {
        return next(new AppError('No trip type found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

module.exports = {
    getAllTripTypes,
    getTripType,
    getTripTypeBySlug,
    createTripType,
    updateTripType,
    deleteTripType,
};
