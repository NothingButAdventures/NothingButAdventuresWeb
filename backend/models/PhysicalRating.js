const mongoose = require("mongoose");
const slugify = require("slugify");

const physicalRatingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A physical rating must have a name"],
            trim: true,
            maxlength: [50, "A physical rating name must have less than 50 characters"],
        },
        slug: {
            type: String,
        },
        level: {
            type: Number,
            required: [true, "A physical rating must have a level"],
            min: 1,
            max: 5,
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
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual populate for tours with this physical rating
physicalRatingSchema.virtual("tours", {
    ref: "Tour",
    foreignField: "physicalRating",
    localField: "_id",
});

// Pre-save middleware to create slug
physicalRatingSchema.pre("save", function (next) {
    if (this.isModified("name") || this.isNew) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Index for faster queries
physicalRatingSchema.index({ slug: 1 });
physicalRatingSchema.index({ isActive: 1 });
physicalRatingSchema.index({ level: 1 });
physicalRatingSchema.index({ order: 1 });

const PhysicalRating = mongoose.model("PhysicalRating", physicalRatingSchema);

module.exports = PhysicalRating;
