const Discount = require("../models/Discount");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");

// Get all discounts
exports.getAllDiscounts = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Discount.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const discounts = await features.query;

    res.status(200).json({
        status: "success",
        results: discounts.length,
        data: {
            discounts,
        },
    });
});

// Get single discount by ID
exports.getDiscount = catchAsync(async (req, res, next) => {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
        return next(new AppError("No discount found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            discount,
        },
    });
});

// Get discount by slug
exports.getDiscountBySlug = catchAsync(async (req, res, next) => {
    const discount = await Discount.findOne({ slug: req.params.slug });

    if (!discount) {
        return next(new AppError("No discount found with that slug", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            discount,
        },
    });
});

// Create new discount
exports.createDiscount = catchAsync(async (req, res, next) => {
    // Add created by user if available
    if (req.user) {
        req.body.createdBy = req.user.id;
    }

    const newDiscount = await Discount.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            discount: newDiscount,
        },
    });
});

// Update discount
exports.updateDiscount = catchAsync(async (req, res, next) => {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!discount) {
        return next(new AppError("No discount found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            discount,
        },
    });
});

// Delete discount
exports.deleteDiscount = catchAsync(async (req, res, next) => {
    const discount = await Discount.findByIdAndDelete(req.params.id);

    if (!discount) {
        return next(new AppError("No discount found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});

// Get active discounts only
exports.getActiveDiscounts = catchAsync(async (req, res, next) => {
    const now = new Date();

    const discounts = await Discount.find({
        isActive: true,
        $or: [
            { validFrom: { $exists: false }, validUntil: { $exists: false } },
            { validFrom: { $lte: now }, validUntil: { $gte: now } },
            { validFrom: { $lte: now }, validUntil: { $exists: false } },
            { validFrom: { $exists: false }, validUntil: { $gte: now } },
        ],
    }).sort({ percentage: -1 });

    res.status(200).json({
        status: "success",
        results: discounts.length,
        data: {
            discounts,
        },
    });
});
