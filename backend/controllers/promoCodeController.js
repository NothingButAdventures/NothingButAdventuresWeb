const PromoCode = require("../models/PromoCode");
const Tour = require("../models/Tour");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");

// Get all promo codes (admin)
exports.getAllPromoCodes = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
        PromoCode.find().populate("countries", "name slug"),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const promoCodes = await features.query;

    res.status(200).json({
        status: "success",
        results: promoCodes.length,
        data: {
            promoCodes,
        },
    });
});

// Get single promo code by ID
exports.getPromoCode = catchAsync(async (req, res, next) => {
    const promoCode = await PromoCode.findById(req.params.id).populate(
        "countries",
        "name slug"
    );

    if (!promoCode) {
        return next(new AppError("No promo code found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            promoCode,
        },
    });
});

// Create new promo code
exports.createPromoCode = catchAsync(async (req, res, next) => {
    if (req.user) {
        req.body.createdBy = req.user.id;
    }

    // Ensure code is uppercase
    if (req.body.code) {
        req.body.code = req.body.code.toUpperCase().trim();
    }

    const newPromoCode = await PromoCode.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            promoCode: newPromoCode,
        },
    });
});

// Update promo code
exports.updatePromoCode = catchAsync(async (req, res, next) => {
    if (req.body.code) {
        req.body.code = req.body.code.toUpperCase().trim();
    }

    const promoCode = await PromoCode.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!promoCode) {
        return next(new AppError("No promo code found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            promoCode,
        },
    });
});

// Delete promo code
exports.deletePromoCode = catchAsync(async (req, res, next) => {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);

    if (!promoCode) {
        return next(new AppError("No promo code found with that ID", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});

// Apply promo code to a tour (user-facing)
exports.applyPromoCode = catchAsync(async (req, res, next) => {
    const { code, tourId } = req.body;

    if (!code || !tourId) {
        return next(new AppError("Please provide a promo code and tour ID", 400));
    }

    // Find the promo code
    const promoCode = await PromoCode.findOne({
        code: code.toUpperCase().trim(),
    }).populate("countries", "name slug");

    if (!promoCode) {
        return next(
            new AppError("Invalid promo code. Please check and try again.", 404)
        );
    }

    // Check if promo is active
    if (!promoCode.isActive) {
        return next(
            new AppError("This promo code is no longer active.", 400)
        );
    }

    // Check date validity
    const now = new Date();
    if (promoCode.startDate && now < promoCode.startDate) {
        return next(
            new AppError("This promo code is not yet active.", 400)
        );
    }
    if (promoCode.endDate && now > promoCode.endDate) {
        return next(
            new AppError("This promo code has expired.", 400)
        );
    }

    // Check max usage
    if (promoCode.usedCount >= promoCode.maxUsers) {
        return next(
            new AppError(
                "This promo code has reached its maximum number of uses.",
                400
            )
        );
    }

    // Fetch the tour to validate applicability
    const tour = await Tour.findById(tourId).populate("country", "name slug");
    if (!tour) {
        return next(new AppError("Tour not found.", 404));
    }

    // Check travel style applicability
    if (promoCode.travelStyles && promoCode.travelStyles.length > 0) {
        const tourStyle = (tour.travelStyle || "").toLowerCase();
        const matchesStyle = promoCode.travelStyles.some(
            (style) => style.toLowerCase() === tourStyle
        );
        if (!matchesStyle) {
            return next(
                new AppError(
                    "This promo code is not applicable for this travel style.",
                    400
                )
            );
        }
    }

    // Check country applicability
    if (promoCode.countries && promoCode.countries.length > 0) {
        const tourCountryId = tour.country?._id?.toString() || tour.country?.toString();
        const matchesCountry = promoCode.countries.some(
            (c) => (c._id || c).toString() === tourCountryId
        );
        if (!matchesCountry) {
            return next(
                new AppError(
                    "This promo code is not applicable for tours in this country.",
                    400
                )
            );
        }
    }

    // Check minimum order value
    if (promoCode.minOrderValue && tour.price.amount < promoCode.minOrderValue) {
        return next(
            new AppError(
                `This promo code requires a minimum order of $${promoCode.minOrderValue}.`,
                400
            )
        );
    }

    // Check if user already has an active (unconsumed, unexpired) application for this tour
    const userId = req.user._id.toString();
    const existingApplication = promoCode.usedBy.find((entry) => {
        return (
            entry.user.toString() === userId &&
            entry.tour.toString() === tourId &&
            !entry.isConsumed &&
            entry.expiresAt > now
        );
    });

    if (existingApplication) {
        // Already applied - return existing discount info
        const timeLeft = Math.ceil(
            (existingApplication.expiresAt - now) / (1000 * 60 * 60)
        );

        let discountAmount = 0;
        if (promoCode.discountType === "percentage") {
            discountAmount = (tour.price.amount * promoCode.discountValue) / 100;
            if (promoCode.maxDiscountAmount) {
                discountAmount = Math.min(discountAmount, promoCode.maxDiscountAmount);
            }
        } else {
            discountAmount = promoCode.discountValue;
        }

        return res.status(200).json({
            status: "success",
            message: "Promo code is already applied to this tour!",
            data: {
                alreadyApplied: true,
                promoCode: {
                    code: promoCode.code,
                    discountType: promoCode.discountType,
                    discountValue: promoCode.discountValue,
                    discountAmount: Math.round(discountAmount * 100) / 100,
                    expiresAt: existingApplication.expiresAt,
                    hoursRemaining: timeLeft,
                },
                finalPrice:
                    Math.round((tour.price.amount - discountAmount) * 100) / 100,
                originalPrice: tour.price.amount,
            },
        });
    }

    // Check if user already used this code on another tour (one use per user per code)
    const userPreviousUse = promoCode.usedBy.find((entry) => {
        return entry.user.toString() === userId && entry.isConsumed;
    });
    if (userPreviousUse) {
        return next(
            new AppError("You have already used this promo code.", 400)
        );
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discountType === "percentage") {
        discountAmount = (tour.price.amount * promoCode.discountValue) / 100;
        if (promoCode.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, promoCode.maxDiscountAmount);
        }
    } else {
        discountAmount = Math.min(promoCode.discountValue, tour.price.amount);
    }

    // Apply: add to usedBy with 24-hour expiration
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    promoCode.usedBy.push({
        user: req.user._id,
        tour: tourId,
        appliedAt: now,
        expiresAt: expiresAt,
        isConsumed: false,
    });
    promoCode.usedCount += 1;
    await promoCode.save({ validateBeforeSave: false });

    res.status(200).json({
        status: "success",
        message: "Promo code applied successfully! Discount valid for 24 hours.",
        data: {
            alreadyApplied: false,
            promoCode: {
                code: promoCode.code,
                discountType: promoCode.discountType,
                discountValue: promoCode.discountValue,
                discountAmount: Math.round(discountAmount * 100) / 100,
                expiresAt: expiresAt,
                hoursRemaining: 24,
            },
            finalPrice:
                Math.round((tour.price.amount - discountAmount) * 100) / 100,
            originalPrice: tour.price.amount,
        },
    });
});

// Check if user has an active promo for a tour (GET request)
exports.checkPromoStatus = catchAsync(async (req, res, next) => {
    const { tourId } = req.params;
    const userId = req.user._id.toString();
    const now = new Date();

    // Find any promo code that has an active (unexpired, unconsumed) application for this user+tour
    const promoCode = await PromoCode.findOne({
        "usedBy.user": req.user._id,
        "usedBy.tour": tourId,
        "usedBy.isConsumed": false,
        "usedBy.expiresAt": { $gt: now },
    });

    if (!promoCode) {
        return res.status(200).json({
            status: "success",
            data: {
                hasActivePromo: false,
            },
        });
    }

    const activeEntry = promoCode.usedBy.find(
        (entry) =>
            entry.user.toString() === userId &&
            entry.tour.toString() === tourId &&
            !entry.isConsumed &&
            entry.expiresAt > now
    );

    if (!activeEntry) {
        return res.status(200).json({
            status: "success",
            data: {
                hasActivePromo: false,
            },
        });
    }

    const tour = await Tour.findById(tourId);
    let discountAmount = 0;
    if (tour) {
        if (promoCode.discountType === "percentage") {
            discountAmount =
                (tour.price.amount * promoCode.discountValue) / 100;
            if (promoCode.maxDiscountAmount) {
                discountAmount = Math.min(
                    discountAmount,
                    promoCode.maxDiscountAmount
                );
            }
        } else {
            discountAmount = Math.min(
                promoCode.discountValue,
                tour.price.amount
            );
        }
    }

    const timeLeft = Math.ceil(
        (activeEntry.expiresAt - now) / (1000 * 60 * 60)
    );

    res.status(200).json({
        status: "success",
        data: {
            hasActivePromo: true,
            promoCode: {
                code: promoCode.code,
                discountType: promoCode.discountType,
                discountValue: promoCode.discountValue,
                discountAmount: Math.round(discountAmount * 100) / 100,
                expiresAt: activeEntry.expiresAt,
                hoursRemaining: timeLeft,
            },
            finalPrice: tour
                ? Math.round((tour.price.amount - discountAmount) * 100) / 100
                : null,
            originalPrice: tour ? tour.price.amount : null,
        },
    });
});
