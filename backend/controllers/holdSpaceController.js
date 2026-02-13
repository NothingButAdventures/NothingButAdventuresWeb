const HoldSpace = require('../models/HoldSpace');
const Tour = require('../models/Tour');
const Discount = require('../models/Discount');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Create a hold space
const createHoldSpace = catchAsync(async (req, res, next) => {
    const { tour: tourId, startDate, numberOfSpots } = req.body;

    // Check if tour exists
    const tour = await Tour.findById(tourId);
    if (!tour || !tour.isActive) {
        return next(new AppError('Tour not found or not available', 404));
    }

    // Check availability for the selected date
    const availability = tour.checkAvailability(startDate);
    if (!availability) {
        return next(new AppError('No availability for the selected date', 400));
    }

    const spots = numberOfSpots || 1;
    if (availability.availableSpots < spots) {
        return next(
            new AppError(
                `Only ${availability.availableSpots} spots available for this date`,
                400
            )
        );
    }

    // Expire any overdue holds first (and restore their spots)
    await expireAndRestoreHolds();

    // Check if user already has an active hold on this tour + date
    const existingHold = await HoldSpace.findOne({
        user: req.user.id,
        tour: tourId,
        startDate: new Date(startDate),
        status: 'active',
    });

    if (existingHold) {
        return next(
            new AppError('You already have an active hold on this date for this tour', 400)
        );
    }

    // Calculate date-specific price (apply discount if present)
    let pricePerPerson = tour.price.amount;

    if (availability.discount) {
        const discountDoc = await Discount.findOne({ name: availability.discount, isActive: true });
        if (discountDoc && discountDoc.percentage > 0) {
            pricePerPerson = Math.round(tour.price.amount * (1 - discountDoc.percentage / 100));
        }
    }

    // 48 hours from now
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const holdData = {
        tour: tourId,
        user: req.user.id,
        startDate: new Date(startDate),
        endDate: availability.endDate ? new Date(availability.endDate) : undefined,
        numberOfSpots: spots,
        expiresAt,
        priceAtHold: {
            amount: pricePerPerson,
            currency: tour.price.currency,
        },
    };

    const newHold = await HoldSpace.create(holdData);

    // Decrease available spots on the tour date
    const dateIndex = tour.startDates.findIndex(
        (sd) => sd.startDate.toDateString() === new Date(startDate).toDateString()
    );
    if (dateIndex !== -1) {
        tour.startDates[dateIndex].availableSpots -= spots;
        await tour.save({ validateBeforeSave: false });
    }

    // Populate tour details for response
    await newHold.populate('tour', 'name slug images duration location price');

    res.status(201).json({
        status: 'success',
        data: {
            holdSpace: newHold,
        },
    });
});

// Get all hold spaces for current user
const getMyHoldSpaces = catchAsync(async (req, res, next) => {
    // Expire overdue holds first (and restore spots)
    await expireAndRestoreHolds();

    const holdSpaces = await HoldSpace.find({ user: req.user.id })
        .populate('tour', 'name slug images duration location price')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: holdSpaces.length,
        data: {
            holdSpaces,
        },
    });
});

// Release (cancel) a hold space
const releaseHoldSpace = catchAsync(async (req, res, next) => {
    const holdSpace = await HoldSpace.findById(req.params.id);

    if (!holdSpace) {
        return next(new AppError('No hold space found with that ID', 404));
    }

    // Check ownership
    if (holdSpace.user.toString() !== req.user.id) {
        return next(new AppError('You can only release your own hold spaces', 403));
    }

    if (holdSpace.status !== 'active') {
        return next(new AppError('This hold space is no longer active', 400));
    }

    holdSpace.status = 'released';
    await holdSpace.save();

    // Restore available spots on the tour date
    await restoreSpots(holdSpace.tour, holdSpace.startDate, holdSpace.numberOfSpots);

    res.status(200).json({
        status: 'success',
        data: {
            holdSpace,
        },
    });
});

// Get a single hold space
const getHoldSpace = catchAsync(async (req, res, next) => {
    const holdSpace = await HoldSpace.findById(req.params.id)
        .populate('tour', 'name slug images duration location price');

    if (!holdSpace) {
        return next(new AppError('No hold space found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            holdSpace,
        },
    });
});

// Helper: restore spots to a tour date
async function restoreSpots(tourId, startDate, numberOfSpots) {
    try {
        const tour = await Tour.findById(tourId);
        if (!tour) return;

        const dateIndex = tour.startDates.findIndex(
            (sd) => sd.startDate.toDateString() === new Date(startDate).toDateString()
        );
        if (dateIndex !== -1) {
            tour.startDates[dateIndex].availableSpots += numberOfSpots;
            await tour.save({ validateBeforeSave: false });
        }
    } catch (err) {
        console.error('Error restoring spots:', err);
    }
}

// Helper: expire overdue holds and restore their spots
async function expireAndRestoreHolds() {
    try {
        const overdueHolds = await HoldSpace.find({
            status: 'active',
            expiresAt: { $lt: new Date() },
        });

        for (const hold of overdueHolds) {
            hold.status = 'expired';
            await hold.save();
            await restoreSpots(hold.tour, hold.startDate, hold.numberOfSpots);
        }
    } catch (err) {
        console.error('Error expiring holds:', err);
    }
}

module.exports = {
    createHoldSpace,
    getMyHoldSpaces,
    releaseHoldSpace,
    getHoldSpace,
};
