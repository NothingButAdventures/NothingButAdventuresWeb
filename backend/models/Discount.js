const mongoose = require("mongoose");
const slugify = require("slugify");

const discountSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A discount must have a name"],
            trim: true,
            maxlength: [100, "Discount name cannot exceed 100 characters"],
        },
        slug: {
            type: String,
            unique: true,
        },
        percentage: {
            type: Number,
            required: [true, "A discount must have a percentage value"],
            min: [0, "Discount percentage cannot be negative"],
            max: [100, "Discount percentage cannot exceed 100%"],
        },
        shortDescription: {
            type: String,
            trim: true,
            maxlength: [300, "Short description cannot exceed 300 characters"],
        },
        description: {
            type: String,
            trim: true,
        },
        color: {
            type: String,
            default: "#22C55E",
        },
        icon: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        validFrom: {
            type: Date,
        },
        validUntil: {
            type: Date,
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

// Generate slug before saving
discountSchema.pre("save", function (next) {
    if (this.isModified("name")) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Index for better query performance
discountSchema.index({ name: 1 });
discountSchema.index({ slug: 1 });
discountSchema.index({ isActive: 1 });
discountSchema.index({ percentage: 1 });

const Discount = mongoose.model("Discount", discountSchema);

module.exports = Discount;
