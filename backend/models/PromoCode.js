const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "A promo code must have a code"],
            unique: true,
            trim: true,
            uppercase: true,
            maxlength: [30, "Promo code cannot exceed 30 characters"],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            default: "percentage",
        },
        discountValue: {
            type: Number,
            required: [true, "A promo code must have a discount value"],
            min: [0, "Discount value cannot be negative"],
        },
        maxUsers: {
            type: Number,
            required: [true, "Maximum number of uses is required"],
            min: [1, "Max users must be at least 1"],
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        usedBy: [
            {
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: "User",
                },
                tour: {
                    type: mongoose.Schema.ObjectId,
                    ref: "Tour",
                },
                appliedAt: {
                    type: Date,
                    default: Date.now,
                },
                expiresAt: {
                    type: Date,
                },
                isConsumed: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        // Duration in days the promo code is valid from creation
        duration: {
            type: Number,
            required: [true, "Duration (in days) is required"],
            min: [1, "Duration must be at least 1 day"],
        },
        startDate: {
            type: Date,
            default: Date.now,
        },
        endDate: {
            type: Date,
        },
        // Optional filters - if empty/null, applies to all
        travelStyles: [
            {
                type: String,
                trim: true,
            },
        ],
        countries: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Country",
            },
        ],
        minOrderValue: {
            type: Number,
            default: 0,
            min: [0, "Minimum order value cannot be negative"],
        },
        maxDiscountAmount: {
            type: Number,
            min: [0, "Maximum discount amount cannot be negative"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: check if promo is currently valid (date-wise)
promoCodeSchema.virtual("isValid").get(function () {
    const now = new Date();
    if (!this.isActive) return false;
    if (this.endDate && now > this.endDate) return false;
    if (this.startDate && now < this.startDate) return false;
    if (this.usedCount >= this.maxUsers) return false;
    return true;
});

// Pre-save: calculate endDate from startDate + duration
promoCodeSchema.pre("save", function (next) {
    if (this.isNew || this.isModified("startDate") || this.isModified("duration")) {
        const start = this.startDate || new Date();
        this.endDate = new Date(start.getTime() + this.duration * 24 * 60 * 60 * 1000);
    }
    next();
});

// Indexes
promoCodeSchema.index({ code: 1 }, { unique: true });
promoCodeSchema.index({ isActive: 1 });
promoCodeSchema.index({ endDate: 1 });
promoCodeSchema.index({ "usedBy.user": 1, "usedBy.tour": 1 });

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

module.exports = PromoCode;
