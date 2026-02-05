const Continent = require('../models/Continent');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const getAllContinents = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Continent.find({ isActive: true }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const continents = await features.query.populate('countries');

    res.status(200).json({
        status: 'success',
        results: continents.length,
        data: {
            continents,
        },
    });
});

const getContinent = catchAsync(async (req, res, next) => {
    const continent = await Continent.findById(req.params.id).populate('countries');

    if (!continent) {
        return next(new AppError('No continent found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            continent,
        },
    });
});

const createContinent = catchAsync(async (req, res, next) => {
    const newContinent = await Continent.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            continent: newContinent,
        },
    });
});

const updateContinent = catchAsync(async (req, res, next) => {
    const continent = await Continent.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!continent) {
        return next(new AppError('No continent found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            continent,
        },
    });
});

const deleteContinent = catchAsync(async (req, res, next) => {
    const continent = await Continent.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
    );

    if (!continent) {
        return next(new AppError('No continent found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

module.exports = {
    getAllContinents,
    getContinent,
    createContinent,
    updateContinent,
    deleteContinent,
};
