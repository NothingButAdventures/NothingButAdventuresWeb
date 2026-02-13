const mongoose = require("mongoose");
const slugify = require("slugify");

const tripTypeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A trip type must have a name"],
            unique: true,
            trim: true,
            maxlength: [50, "A trip type name must have less than 50 characters"],
        },
        slug: {
            type: String,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
        },
        shortDescription: {
            type: String,
            trim: true,
            maxlength: [200, "Short description must have less than 200 characters"],
        },
        icon: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        color: {
            type: String,
            default: "#3B82F6",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        seo: {
            metaTitle: String,
            metaDescription: String,
            keywords: [String],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual populate for tours with this trip type
tripTypeSchema.virtual("tours", {
    ref: "Tour",
    foreignField: "tripType",
    localField: "_id",
});

// Pre-save middleware to create slug
tripTypeSchema.pre("save", function (next) {
    if (this.isModified("name") || this.isNew) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Index for faster queries
tripTypeSchema.index({ slug: 1 });
tripTypeSchema.index({ isActive: 1 });
tripTypeSchema.index({ order: 1 });

const TripType = mongoose.model("TripType", tripTypeSchema);

module.exports = TripType;
