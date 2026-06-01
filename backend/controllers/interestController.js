const Interest = require('../models/Interest');
const Tour = require('../models/Tour');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const getAllInterests = catchAsync(async (req, res, next) => {
    // If not admin, we may want to only show active ones. However, in admin dashboard, we show all.
    // The query can be filtered by APIFeatures.
    const features = new APIFeatures(Interest.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const interests = await features.query;

    res.status(200).json({
        status: 'success',
        results: interests.length,
        data: {
            interests,
        },
    });
});

const getInterest = catchAsync(async (req, res, next) => {
    const interest = await Interest.findById(req.params.id);

    if (!interest) {
        return next(new AppError('No interest found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            interest,
        },
    });
});

const getInterestBySlug = catchAsync(async (req, res, next) => {
    const interest = await Interest.findOne({ slug: req.params.slug, isActive: true });

    if (!interest) {
        return next(new AppError('No interest found with that slug', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            interest,
        },
    });
});

const createInterest = catchAsync(async (req, res, next) => {
    const normalizedName = (req.body.name || '').trim();
    if (!normalizedName) {
        return next(new AppError('An interest must have a name', 400));
    }

    req.body.name = normalizedName;

    // Check if duplicate interest already exists
    const existingInterest = await Interest.findOne({ name: normalizedName });
    if (existingInterest) {
        return next(new AppError('An interest with this name already exists', 400));
    }

    const newInterest = await Interest.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            interest: newInterest,
        },
    });
});

const updateInterest = catchAsync(async (req, res, next) => {
    const interest = await Interest.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!interest) {
        return next(new AppError('No interest found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            interest,
        },
    });
});

const deleteInterest = catchAsync(async (req, res, next) => {
    const interest = await Interest.findById(req.params.id);

    if (!interest) {
        return next(new AppError('No interest found with that ID', 404));
    }

    // Check if any tours are using this interest
    const toursUsingInterest = await Tour.countDocuments({ interests: interest.name });

    if (toursUsingInterest > 0) {
        return next(
            new AppError(
                `Cannot delete this interest. ${toursUsingInterest} tour(s) are using it. Please reassign or delete those tours first.`,
                400
            )
        );
    }

    await Interest.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

module.exports = {
    getAllInterests,
    getInterest,
    getInterestBySlug,
    createInterest,
    updateInterest,
    deleteInterest,
};
