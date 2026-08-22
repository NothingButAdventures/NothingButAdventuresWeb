const mongoose = require("mongoose");
const slugify = require("slugify");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A job title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      default: "Remote",
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Remote", "Internship"],
      default: "Full-time",
    },
    experienceLevel: {
      type: String,
      enum: ["Entry Level", "Mid Level", "Senior Level", "Lead / Manager", "Executive"],
      default: "Mid Level",
    },
    salaryRange: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    responsibilities: [
      {
        type: String,
      },
    ],
    requirements: [
      {
        type: String,
      },
    ],
    benefits: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "draft", "closed"],
      default: "active",
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Slugify title before saving
jobSchema.pre("save", function (next) {
  if (this.isModified("title") || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + "-" + Date.now();
  }
  next();
});

// Virtual populate for applications count
jobSchema.virtual("applicationsCount", {
  ref: "JobApplication",
  foreignField: "job",
  localField: "_id",
  count: true,
});

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
