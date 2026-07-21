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
    if (spots > 6) {
        return next(
            new AppError('Maximum 6 spots can be held at a time for Hold Space', 400)
        );
    }

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

    // Check if user already has any active hold space (only 1 active hold allowed per user across all tours)
    const existingHold = await HoldSpace.findOne({
        user: req.user.id,
        status: 'active',
        expiresAt: { $gt: new Date() },
    }).populate('tour', 'name');

    if (existingHold) {
        const tourName = existingHold.tour?.name || 'a tour';
        return next(
            new AppError(
                `You already have an active hold space for "${tourName}". You can only hold one space at a time. Please release your existing hold space from your profile before holding another space.`,
                400
            )
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
        travelers: req.body.travelers || [],
        extras: req.body.extras || {},
        specialRequests: req.body.specialRequests || '',
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
    await newHold.populate('tour', 'name slug tourCode images duration location price');

    // Dispatch email notification
    const { sendHoldSpaceCreatedEmail } = require('../utils/emailService');
    sendHoldSpaceCreatedEmail(req.user.email, {
        name: req.user.name,
        tourName: tour.name,
        holdReference: newHold.holdReference,
        numberOfSpots: spots,
        startDate: newHold.startDate,
        price: newHold.priceAtHold,
        expiresAt: newHold.expiresAt,
    }).catch((err) => {
        console.error('Failed to send hold space created email:', err.message);
    });

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
        .populate('tour', 'name slug tourCode images duration location price')
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

    // Populate tour to get the tour name for the email
    await holdSpace.populate('tour', 'name');

    // Send hold released email notification
    const { sendHoldSpaceReleasedEmail } = require('../utils/emailService');
    sendHoldSpaceReleasedEmail(req.user.email, {
        name: req.user.name,
        tourName: holdSpace.tour?.name || 'Tour',
        holdReference: holdSpace.holdReference,
    }).catch((err) => {
        console.error('Failed to send hold space released email:', err.message);
    });

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
        .populate('tour', 'name slug tourCode images duration location price');

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

// Background worker to check hold space deadlines and dispatch emails
const checkHoldSpaceDeadlines = async () => {
    try {
        const now = new Date();
        const time24hAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const {
            sendHoldSpace24hReminderEmail,
            sendHoldSpace46hReminderEmail,
            sendHoldSpaceExpiredEmail,
        } = require('../utils/emailService');

        // 1. Process 24-hour reminders
        // Find active holds created at least 24 hours ago that haven't received the 24h reminder
        const holdsFor24h = await HoldSpace.find({
            status: 'active',
            createdAt: { $lte: time24hAgo },
            reminderSent24h: false,
        }).populate('user').populate('tour');

        for (const hold of holdsFor24h) {
            if (hold.user && hold.tour) {
                await sendHoldSpace24hReminderEmail(hold.user.email, {
                    name: hold.user.name,
                    tourName: hold.tour.name,
                    holdReference: hold.holdReference,
                    expiresAt: hold.expiresAt,
                });
            }
            hold.reminderSent24h = true;
            await hold.save({ validateBeforeSave: false });
        }

        // 2. Process 46-hour reminders (2 hours before expiry)
        // Find active holds expiring in 2 hours or less that haven't received the 46h reminder
        const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const holdsFor46h = await HoldSpace.find({
            status: 'active',
            expiresAt: { $lte: twoHoursFromNow },
            reminderSent46h: false,
        }).populate('user').populate('tour');

        for (const hold of holdsFor46h) {
            if (hold.user && hold.tour) {
                await sendHoldSpace46hReminderEmail(hold.user.email, {
                    name: hold.user.name,
                    tourName: hold.tour.name,
                    holdReference: hold.holdReference,
                    expiresAt: hold.expiresAt,
                });
            }
            hold.reminderSent46h = true;
            await hold.save({ validateBeforeSave: false });
        }

        // 3. Process Expirations
        // Find active holds that have passed their expiresAt, expire them, restore spots, and send expiry email
        const overdueHolds = await HoldSpace.find({
            status: 'active',
            expiresAt: { $lt: now },
        }).populate('user').populate('tour');

        for (const hold of overdueHolds) {
            hold.status = 'expired';
            hold.expiryEmailSent = true;
            await hold.save({ validateBeforeSave: false });
            await restoreSpots(hold.tour._id || hold.tour, hold.startDate, hold.numberOfSpots);

            if (hold.user && hold.tour) {
                await sendHoldSpaceExpiredEmail(hold.user.email, {
                    name: hold.user.name,
                    tourName: hold.tour.name,
                    holdReference: hold.holdReference,
                });
            }
        }

        // 4. Process Expiry Emails for already expired holds that haven't received the expiry email yet
        // (e.g. if they expired during getMyHoldSpaces or releaseHoldSpace)
        const expiredWithoutEmail = await HoldSpace.find({
            status: 'expired',
            expiryEmailSent: false,
        }).populate('user').populate('tour');

        for (const hold of expiredWithoutEmail) {
            hold.expiryEmailSent = true;
            await hold.save({ validateBeforeSave: false });

            if (hold.user && hold.tour) {
                await sendHoldSpaceExpiredEmail(hold.user.email, {
                    name: hold.user.name,
                    tourName: hold.tour.name,
                    holdReference: hold.holdReference,
                });
            }
        }
    } catch (err) {
        console.error('Error checking hold space deadlines:', err);
    }
};

module.exports = {
    createHoldSpace,
    getMyHoldSpaces,
    releaseHoldSpace,
    getHoldSpace,
    checkHoldSpaceDeadlines,
};
