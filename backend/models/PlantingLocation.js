const mongoose = require("mongoose");
const slugify = require("slugify");

const plantingLocationSchema = new mongoose.Schema(
  {
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: [true, "A planting location must belong to a country"],
    },
    locationName: {
      type: String,
      required: [true, "A planting location must have a location name"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
    },
    plantSpecies: {
      type: [String],
      default: [],
    },
    faqs: [
      {
        question: {
          type: String,
          required: [true, "An FAQ must have a question"],
          trim: true,
        },
        answer: {
          type: String,
          required: [true, "An FAQ must have an answer"],
          trim: true,
        },
      },
    ],
    gallery: {
      type: [String],
      default: [],
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

// Add index on country, slug and isActive for fast querying
plantingLocationSchema.index({ country: 1 });
plantingLocationSchema.index({ slug: 1 });
plantingLocationSchema.index({ isActive: 1 });

// Pre-save middleware to create slug
plantingLocationSchema.pre("save", function (next) {
  if (this.isModified("locationName") || this.isNew) {
    this.slug = slugify(this.locationName, { lower: true, strict: true });
  }
  next();
});

const PlantingLocation = mongoose.model("PlantingLocation", plantingLocationSchema);

module.exports = PlantingLocation;
