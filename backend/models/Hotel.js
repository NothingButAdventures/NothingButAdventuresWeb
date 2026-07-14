const mongoose = require("mongoose");
const slugify = require("slugify");

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A hotel must have a name"],
      trim: true,
      maxlength: [200, "Hotel name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
    location: {
      type: String,
      required: [true, "A hotel must have a location"],
      trim: true,
    },
    destination: {
      type: mongoose.Schema.ObjectId,
      ref: "Country",
      required: [true, "A hotel must belong to a destination (Country)"],
    },
    privateRoomPrice: {
      type: Number,
      default: 0,
      min: [0, "Private room price cannot be negative"],
    },
    sharedRoomPrice: {
      type: Number,
      default: 0,
      min: [0, "Shared room price cannot be negative"],
    },
    image: {
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

hotelSchema.index({ destination: 1 });
hotelSchema.index({ isActive: 1 });
hotelSchema.index({ slug: 1 });

hotelSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Hotel = mongoose.model("Hotel", hotelSchema);

module.exports = Hotel;
