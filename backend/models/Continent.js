const mongoose = require("mongoose");
const slugify = require("slugify");

const continentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "A continent must have a name"],
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
        },
        image: {
            type: String,
            default: "default-continent.jpg",
        },
        description: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual populate for countries in this continent
continentSchema.virtual("countries", {
    ref: "Country",
    foreignField: "continent",
    localField: "_id",
});

// Pre-save middleware to create slug
continentSchema.pre("save", function (next) {
    if (this.isModified("name") || this.isNew) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

const Continent = mongoose.model("Continent", continentSchema);

module.exports = Continent;
