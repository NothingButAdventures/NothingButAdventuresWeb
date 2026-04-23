const TravelStyle = require('../models/TravelStyle');
const Tour = require('../models/Tour');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const getAllTravelStyles = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(TravelStyle.find({ isActive: true }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const travelStyles = await features.query;

    res.status(200).json({
        status: 'success',
        results: travelStyles.length,
        data: {
            travelStyles,
        },
    });
});

const getTravelStyle = catchAsync(async (req, res, next) => {
    const travelStyle = await TravelStyle.findById(req.params.id);

    if (!travelStyle) {
        return next(new AppError('No travel style found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            travelStyle,
        },
    });
});

const getTravelStyleBySlug = catchAsync(async (req, res, next) => {
    const travelStyle = await TravelStyle.findOne({ slug: req.params.slug, isActive: true });

    if (!travelStyle) {
        return next(new AppError('No travel style found with that slug', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            travelStyle,
        },
    });
});

const createTravelStyle = catchAsync(async (req, res, next) => {
    const normalizedName = (req.body.name || '').trim();
    if (!normalizedName) {
        return next(new AppError('A travel style must have a name', 400));
    }

    req.body.name = normalizedName;

    // Backward-compatibility: clean up old soft-deleted duplicates from previous logic.
    const existingStyle = await TravelStyle.findOne({ name: normalizedName });
    if (existingStyle) {
        if (existingStyle.isActive === false) {
            await TravelStyle.findByIdAndDelete(existingStyle._id);
        } else {
            return next(new AppError('A travel style with this name already exists', 400));
        }
    }

    const newTravelStyle = await TravelStyle.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            travelStyle: newTravelStyle,
        },
    });
});

const updateTravelStyle = catchAsync(async (req, res, next) => {
    const travelStyle = await TravelStyle.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!travelStyle) {
        return next(new AppError('No travel style found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            travelStyle,
        },
    });
});

const deleteTravelStyle = catchAsync(async (req, res, next) => {
    // Check if any tours are using this travel style
    const toursUsingStyle = await Tour.countDocuments({ travelStyle: req.params.id });

    if (toursUsingStyle > 0) {
        return next(new AppError(`Cannot delete this travel style. ${toursUsingStyle} tour(s) are using it. Please reassign or delete those tours first.`, 400));
    }

    const travelStyle = await TravelStyle.findByIdAndDelete(req.params.id);

    if (!travelStyle) {
        return next(new AppError('No travel style found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

module.exports = {
    getAllTravelStyles,
    getTravelStyle,
    getTravelStyleBySlug,
    createTravelStyle,
    updateTravelStyle,
    deleteTravelStyle,
};
