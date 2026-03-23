const Query = require('../models/Query');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const APIFeatures = require('../utils/apiFeatures');

const createQuery = catchAsync(async (req, res, next) => {
    const newQuery = await Query.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            query: newQuery,
        },
    });
});

const getAllQueries = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Query.find(), req.query)
        .filter()
        .sort('-createdAt')
        .limitFields()
        .paginate();

    const queries = await features.query;

    res.status(200).json({
        status: 'success',
        results: queries.length,
        data: {
            queries,
        },
    });
});

const updateQueryStatus = catchAsync(async (req, res, next) => {
    const query = await Query.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!query) {
        return next(new AppError('No query found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            query,
        },
    });
});

const deleteQuery = catchAsync(async (req, res, next) => {
    const query = await Query.findByIdAndDelete(req.params.id);

    if (!query) {
        return next(new AppError('No query found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

module.exports = {
    createQuery,
    getAllQueries,
    updateQueryStatus,
    deleteQuery,
};
