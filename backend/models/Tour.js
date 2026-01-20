const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      trim: true,
      maxlength: [200, "Tour name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    country: {
      type: mongoose.Schema.ObjectId,
      ref: "Country",
      required: [true, "Tour must belong to a country"],
    },
    summary: {
      type: String,
      required: [true, "A tour must have a summary"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "A tour must have a description"],
      trim: true,
    },
    duration: {
      days: {
        type: Number,
        required: [true, "A tour must have duration in days"],
        min: [1, "Duration must be at least 1 day"],
      },
      nights: {
        type: Number,
        required: [true, "A tour must have nights count"],
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
      min: [1, "Group size must be at least 1"],
      max: [50, "Group size cannot exceed 50"],
    },

    physicalRating: {
      level: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      description: String,
    },
    price: {
      amount: {
        type: Number,
        required: [true, "A tour must have a price"],
      },
      currency: {
        type: String,
        required: true,
        default: "USD",
      },
      discountPercent: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"],
        max: [90, "Discount cannot exceed 90%"],
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating cannot exceed 5"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          trim: true,
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    startDates: [
      {
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        availableSpots: {
          type: Number,
          required: true,
        },
        price: {
          amount: Number,
          currency: {
            type: String,
            default: "USD",
          },
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    itinerary: [
      {
        day: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          required: true,
          trim: true,
        },
        imageUrl: {
          type: String,
          trim: true,
        },
        activities: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },
            description: {
              type: String,
              required: true,
              trim: true,
            },
            placeName: {
              type: String,
              required: true,
              trim: true,
            },
            duration: {
              type: String,
              required: true,
              trim: true,
            },
            icon: {
              type: String,
              required: true,
              enum: [
                "MapPin",
                "Bus",
                "Car",
                "Airplane",
                "Train",
                "Boat",
                "Coffee",
                "Camera",
                "Mountain",
                "Trees",
                "Utensils",
                "Clock",
                "Heart",
              ],
            },
          },
        ],
        optionalActivities: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },
            price: {
              amount: {
                type: Number,
                required: true,
              },
              currency: {
                type: String,
                default: "USD",
              },
            },
            place: {
              type: String,
              required: true,
              trim: true,
            },
            description: {
              type: String,
              required: true,
              trim: true,
            },
            duration: {
              type: String,
              required: true,
              trim: true,
            },
            icon: {
              type: String,
              required: true,
              enum: [
                "MapPin",
                "Bus",
                "Car",
                "Airplane",
                "Train",
                "Boat",
                "Coffee",
                "Camera",
                "Mountain",
                "Trees",
                "Utensils",
                "Clock",
                "Heart",
              ],
            },
          },
        ],
        accommodations: [
          {
            name: {
              type: String,
              required: true,
              trim: true,
            },
            type: {
              type: String,
              required: true,
              enum: ["Hotel", "Lounge", "Cottage", "Guestroom", "Camp"],
            },
            rating: {
              type: Number,
              min: 1,
              max: 5,
            },
            description: String,
          },
        ],
        meals: {
          breakfast: {
            type: Boolean,
            default: false,
          },
          lunch: {
            type: Boolean,
            default: false,
          },
          dinner: {
            type: Boolean,
            default: false,
          },
        },
        transport: [
          {
            type: {
              type: String,
              enum: [
                "bus",
                "car",
                "plane",
                "train",
                "boat",
                "walking",
                "cycling",
              ],
            },
            description: String,
            duration: String,
          },
        ],
        images: [String],
      },
    ],
    inclusions: {
      accommodation: {
        type: String,
        trim: true,
      },
      meals: [String],
      transport: [String],
      activities: [String],
      guides: {
        type: String,
        trim: true,
      },
      other: [String],
    },
    exclusions: [String],
    travelStyle: {
      type: String,
      required: [true, "A tour must have a travel style"],
      enum: [
        "Classic",
        "Solo-ish Adventures",
        "NexTrip Journeys",
        "Family",
        "Adventure",
        "Luxury",
        "Budget",
      ],
    },
    serviceLevel: {
      type: String,
      required: [true, "A tour must have a service level"],
      enum: ["Standard", "Comfort", "Premium", "Luxury"],
    },

    ageRequirement: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 99,
      },
      description: String,
    },
    specialMoments: [
      {
        type: {
          type: String,
          enum: [
            "Welcome Moment",
            "We Day",
            "N-Day",
            "Me Day",
            "Dinner Party",
            "Good Karma Moment",
          ],
        },
        title: String,
        description: String,
        location: String,
      },
    ],
    highlights: [String],
    location: {
      startCity: {
        type: String,
        required: true,
        trim: true,
      },
      endCity: {
        type: String,
        required: true,
        trim: true,
      },
      visitedCities: [String],
      coordinates: [
        {
          latitude: Number,
          longitude: Number,
          name: String,
        },
      ],
    },
    guides: [
      {
        name: String,
        specialty: String,
        experience: Number,
        languages: [String],
        bio: String,
        image: String,
      },
    ],
    faqs: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },
        answer: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    additionalInfo: {
      packingList: [String],
      healthSafety: String,
      weatherInfo: String,
      cultureInfo: String,
      tipping: String,
      visa: String,
      insurance: String,
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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
  },
);

// Indexes
tourSchema.index({ slug: 1 });
tourSchema.index({ country: 1 });
tourSchema.index({ price: 1 });
tourSchema.index({ ratingsAverage: -1 });
tourSchema.index({ startDates: 1 });
tourSchema.index({ isActive: 1 });
tourSchema.index({ isFeatured: -1 });
tourSchema.index({ travelStyle: 1 });

tourSchema.index({ "duration.days": 1 });

// Compound indexes
tourSchema.index({ country: 1, isActive: 1 });
tourSchema.index({ ratingsAverage: -1, ratingsQuantity: -1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });

// Virtual populate for reviews
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

// Virtual for discounted price
tourSchema.virtual("discountedPrice").get(function () {
  if (this.price.discountPercent > 0) {
    return this.price.amount * (1 - this.price.discountPercent / 100);
  }
  return this.price.amount;
});

// Virtual for duration text
tourSchema.virtual("durationText").get(function () {
  const days = this.duration.days;
  const nights = this.duration.nights;
  return `${days} Day${days > 1 ? "s" : ""}, ${nights} Night${nights > 1 ? "s" : ""}`;
});

// Pre-save middleware to create slug
tourSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Pre-save middleware to calculate nights from days
tourSchema.pre("save", function (next) {
  if (this.isModified("duration.days") || this.isNew) {
    this.duration.nights = Math.max(0, this.duration.days - 1);
  }
  next();
});

// Static method to get tour stats
tourSchema.statics.getTourStats = async function (countryId) {
  const stats = await this.aggregate([
    { $match: { country: countryId, isActive: true } },
    {
      $group: {
        _id: null,
        numTours: { $sum: 1 },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price.amount" },
        minPrice: { $min: "$price.amount" },
        maxPrice: { $max: "$price.amount" },
        totalReviews: { $sum: "$ratingsQuantity" },
      },
    },
  ]);

  return stats.length > 0 ? stats[0] : null;
};

// Static method to get popular tours
tourSchema.statics.getPopularTours = async function (limit = 10) {
  return this.find({ isActive: true })
    .sort({ ratingsAverage: -1, ratingsQuantity: -1 })
    .limit(limit)
    .populate("country", "name slug")
    .select(
      "name slug summary price ratingsAverage ratingsQuantity duration images",
    );
};

// Instance method to check availability for a date
tourSchema.methods.checkAvailability = function (date) {
  const startDate = this.startDates.find(
    (sd) =>
      sd.date.toDateString() === new Date(date).toDateString() &&
      sd.isActive &&
      sd.availableSpots > 0,
  );
  return startDate || null;
};

// Update country statistics after tour save
tourSchema.post("save", async function () {
  const Country = mongoose.model("Country");
  await Country.findByIdAndUpdate(this.country, {
    $inc: { "statistics.totalTours": 1 },
  });
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
