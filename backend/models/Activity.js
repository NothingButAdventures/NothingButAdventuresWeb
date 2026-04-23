const mongoose = require("mongoose");
const slugify = require("slugify");

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "An activity must have a title"],
      trim: true,
      maxlength: [200, "Activity title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "An activity must have a description"],
      trim: true,
    },
    destination: {
      type: mongoose.Schema.ObjectId,
      ref: "Country",
      required: [true, "An activity must belong to a destination (Country)"],
    },
    travelStyle: {
      type: mongoose.Schema.ObjectId,
      ref: "TravelStyle",
      required: [true, "An activity must have a travel style"],
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, "Price cannot be negative"],
    },
    physicalRating: {
      type: mongoose.Schema.ObjectId,
      ref: "PhysicalRating",
      required: [true, "An activity must have a physical rating"],
    },
    ageGroup: {
      type: String,
      required: [true, "An activity must specify an age group"],
      trim: true,
    },
    coverImage: {
      type: String,
      default: "",
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

// Indexes
activitySchema.index({ destination: 1 });
activitySchema.index({ travelStyle: 1 });
activitySchema.index({ isActive: 1 });
activitySchema.index({ slug: 1 });

// Pre-save middleware to create slug
activitySchema.pre("save", function (next) {
  if (this.isModified("title") || this.isNew) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
