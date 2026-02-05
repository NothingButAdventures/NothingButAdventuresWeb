const mongoose = require("mongoose");
const slugify = require("slugify");

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A country must have a name"],
      unique: true,
      trim: true,
      maxlength: [100, "Country name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    code: {
      type: String,
      unique: true,
      uppercase: true,
      length: [2, "Country code must be exactly 2 characters"],
      sparse: true,
    },
    continent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Continent",
      required: [true, "A country must belong to a continent"],
    },
    description: {
      type: String,
      trim: true,
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    image: {
      type: String,
    },
    currency: {
      code: {
        type: String,
        uppercase: true,
        length: [3, "Currency code must be exactly 3 characters"],
      },
      name: {
        type: String,
      },
      symbol: {
        type: String,
      },
    },
    language: [
      {
        name: {
          type: String,
          required: true,
        },
        code: {
          type: String,
          required: true,
          lowercase: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    timezone: [
      {
        name: {
          type: String,
          required: true,
        },
        offset: {
          type: String,
          required: true,
        },
      },
    ],
    climate: {
      type: String,
      enum: [
        "tropical",
        "temperate",
        "arid",
        "polar",
        "mediterranean",
        "continental",
        "subtropical",
      ],
    },
    bestTimeToVisit: [
      {
        season: {
          type: String,
          enum: ["spring", "summer", "autumn", "winter"],
        },
        months: [String],
        description: String,
      },
    ],
    travelRequirements: {
      visaRequired: {
        type: Boolean,
        default: true,
      },
      visaOnArrival: {
        type: Boolean,
        default: false,
      },
      eVisa: {
        type: Boolean,
        default: false,
      },
      vaccinations: [
        {
          name: String,
          required: Boolean,
          description: String,
        },
      ],
      healthAdvisory: String,
    },
    attractions: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: [
            "historical",
            "natural",
            "cultural",
            "religious",
            "adventure",
            "urban",
          ],
        },
        description: String,
        location: {
          city: String,
          coordinates: {
            latitude: Number,
            longitude: Number,
          },
        },
      },
    ],
    statistics: {
      totalTours: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        default: 0,
        min: [0, "Rating must be at least 0"],
        max: [5, "Rating cannot exceed 5"],
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      popularityScore: {
        type: Number,
        default: 0,
      },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
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
  },
);

// Indexes (name, slug, code already indexed via unique constraints)
countrySchema.index({ continent: 1 });
countrySchema.index({ isActive: 1 });
countrySchema.index({ "statistics.popularityScore": -1 });

// Virtual populate for tours in this country
countrySchema.virtual("tours", {
  ref: "Tour",
  foreignField: "country",
  localField: "_id",
});

// Pre-save middleware to create slug
countrySchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Update statistics when tours are added/removed
countrySchema.methods.updateStatistics = async function () {
  const Tour = mongoose.model("Tour");
  const stats = await Tour.aggregate([
    { $match: { country: this._id, isActive: true } },
    {
      $group: {
        _id: null,
        totalTours: { $sum: 1 },
        averageRating: { $avg: "$ratingsAverage" },
        totalReviews: { $sum: "$ratingsQuantity" },
      },
    },
  ]);

  if (stats.length > 0) {
    this.statistics.totalTours = stats[0].totalTours;
    this.statistics.averageRating =
      Math.round(stats[0].averageRating * 10) / 10;
    this.statistics.totalReviews = stats[0].totalReviews;
    this.statistics.popularityScore = this.calculatePopularityScore();
  } else {
    this.statistics = {
      totalTours: 0,
      averageRating: 0,
      totalReviews: 0,
      popularityScore: 0,
    };
  }

  await this.save({ validateBeforeSave: false });
};

// Calculate popularity score based on tours, reviews, and ratings
countrySchema.methods.calculatePopularityScore = function () {
  const tourWeight = 0.4;
  const reviewWeight = 0.3;
  const ratingWeight = 0.3;

  return (
    this.statistics.totalTours * tourWeight +
    this.statistics.totalReviews * reviewWeight +
    this.statistics.averageRating * ratingWeight
  );
};

const Country = mongoose.model("Country", countrySchema);

module.exports = Country;
