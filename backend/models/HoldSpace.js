const mongoose = require('mongoose');

const holdSpaceSchema = new mongoose.Schema(
    {
        tour: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour',
            required: [true, 'Hold must belong to a tour'],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Hold must belong to a user'],
        },
        startDate: {
            type: Date,
            required: [true, 'Hold must have a start date'],
        },
        endDate: {
            type: Date,
        },
        numberOfSpots: {
            type: Number,
            required: true,
            min: [1, 'Must hold at least 1 spot'],
            default: 1,
        },
        holdReference: {
            type: String,
            unique: true,
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'converted', 'released'],
            default: 'active',
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        priceAtHold: {
            amount: {
                type: Number,
                required: true,
            },
            currency: {
                type: String,
                default: 'USD',
            },
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Index for auto-expiry queries
holdSpaceSchema.index({ expiresAt: 1 });
holdSpaceSchema.index({ user: 1, status: 1 });
holdSpaceSchema.index({ tour: 1, startDate: 1, user: 1 });

// Generate hold reference before saving
holdSpaceSchema.pre('save', function (next) {
    if (this.isNew) {
        const timestamp = Date.now().toString();
        const randomNum = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');
        this.holdReference = `HOLD-${timestamp.slice(-8)}-${randomNum}`;
    }
    next();
});

// Virtual: check if hold is still valid
holdSpaceSchema.virtual('isActive').get(function () {
    return this.status === 'active' && new Date() < this.expiresAt;
});

// Virtual: remaining time in ms
holdSpaceSchema.virtual('remainingTime').get(function () {
    if (this.status !== 'active') return 0;
    const remaining = this.expiresAt.getTime() - Date.now();
    return remaining > 0 ? remaining : 0;
});

// Static: expire all overdue holds
holdSpaceSchema.statics.expireOverdueHolds = async function () {
    const result = await this.updateMany(
        { status: 'active', expiresAt: { $lt: new Date() } },
        { status: 'expired' }
    );
    return result;
};

const HoldSpace = mongoose.model('HoldSpace', holdSpaceSchema);

module.exports = HoldSpace;
