const mongoose = require("mongoose");
const slugify = require("slugify");

const travelStyleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A travel style must have a name"],
            unique: true,
            trim: true,
            maxlength: [50, "A travel style name must have less than 50 characters"],
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
            default: "#3B82F6", // Default blue color
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

// Virtual populate for tours with this travel style
travelStyleSchema.virtual("tours", {
    ref: "Tour",
    foreignField: "travelStyle",
    localField: "_id",
});

// Pre-save middleware to create slug
travelStyleSchema.pre("save", function (next) {
    if (this.isModified("name") || this.isNew) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Index for faster queries
travelStyleSchema.index({ slug: 1 });
travelStyleSchema.index({ isActive: 1 });
travelStyleSchema.index({ order: 1 });

const TravelStyle = mongoose.model("TravelStyle", travelStyleSchema);

module.exports = TravelStyle;
