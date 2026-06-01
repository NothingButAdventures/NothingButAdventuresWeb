const mongoose = require("mongoose");
const slugify = require("slugify");

const interestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "An interest must have a name"],
            unique: true,
            trim: true,
            maxlength: [50, "An interest name must have less than 50 characters"],
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
        url: {
            type: String,
            trim: true,
            default: "",
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

// Pre-save middleware to create slug
interestSchema.pre("save", function (next) {
    if (this.isModified("name") || this.isNew) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Indexes for faster queries
interestSchema.index({ slug: 1 });
interestSchema.index({ isActive: 1 });
interestSchema.index({ order: 1 });

const Interest = mongoose.model("Interest", interestSchema);

module.exports = Interest;
