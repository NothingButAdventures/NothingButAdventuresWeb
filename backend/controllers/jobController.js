const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// ─────────────────────────────────────────────
// PUBLIC CONTROLLERS
// ─────────────────────────────────────────────

// Get all active jobs (public)
const getAllJobs = catchAsync(async (req, res, next) => {
  const queryObj = { status: "active", ...req.query };
  delete queryObj.search;

  let query = Job.find({ status: "active" });

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    query = query.find({
      $or: [
        { title: searchRegex },
        { department: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
      ],
    });
  }

  if (req.query.department) {
    query = query.find({ department: req.query.department });
  }

  if (req.query.type) {
    query = query.find({ type: req.query.type });
  }

  if (req.query.location) {
    query = query.find({ location: req.query.location });
  }

  const jobs = await query.sort("-createdAt");

  // Get distinct departments and locations for filter chips
  const departments = await Job.distinct("department", { status: "active" });
  const locations = await Job.distinct("location", { status: "active" });

  res.status(200).json({
    status: "success",
    results: jobs.length,
    data: {
      jobs,
      filterOptions: {
        departments,
        locations,
      },
    },
  });
});

// Get single job by ID or Slug (public)
const getJob = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  let job = await Job.findById(id);

  if (!job) {
    job = await Job.findOne({ slug: id });
  }

  if (!job || (job.status !== "active" && (!req.user || req.user.role !== "admin"))) {
    return next(new AppError("Job posting not found or is no longer active", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      job,
    },
  });
});

// Apply for job (public)
const applyForJob = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;
  const {
    fullName,
    email,
    phone,
    linkedinUrl,
    portfolioUrl,
    resumeUrl,
    coverLetter,
    experienceYears,
    currentCompany,
  } = req.body;

  const job = await Job.findById(jobId);
  if (!job || job.status !== "active") {
    return next(new AppError("This job posting is not accepting applications", 400));
  }

  if (!fullName || !email || !resumeUrl) {
    return next(new AppError("Full name, email, and resume are required", 400));
  }

  const application = await JobApplication.create({
    job: jobId,
    fullName,
    email,
    phone,
    linkedinUrl,
    portfolioUrl,
    resumeUrl,
    coverLetter,
    experienceYears,
    currentCompany,
  });

  res.status(201).json({
    status: "success",
    message: "Application submitted successfully!",
    data: {
      application,
    },
  });
});

// ─────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────

// Admin get all jobs with applications count
const adminGetAllJobs = catchAsync(async (req, res, next) => {
  const jobs = await Job.find().sort("-createdAt").populate("applicationsCount");

  res.status(200).json({
    status: "success",
    results: jobs.length,
    data: {
      jobs,
    },
  });
});

// Create new job posting (admin)
const createJob = catchAsync(async (req, res, next) => {
  const job = await Job.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      job,
    },
  });
});

// Update job posting (admin)
const updateJob = catchAsync(async (req, res, next) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!job) {
    return next(new AppError("No job found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      job,
    },
  });
});

// Delete job posting (admin)
const deleteJob = catchAsync(async (req, res, next) => {
  const job = await Job.findByIdAndDelete(req.params.id);

  if (!job) {
    return next(new AppError("No job found with that ID", 404));
  }

  // Delete all associated applications
  await JobApplication.deleteMany({ job: req.params.id });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Toggle status (admin)
const toggleJobStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  if (!["active", "draft", "closed"].includes(status)) {
    return next(new AppError("Invalid status value", 400));
  }

  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!job) {
    return next(new AppError("No job found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      job,
    },
  });
});

// Admin get all job applications
const adminGetAllApplications = catchAsync(async (req, res, next) => {
  const { jobId } = req.query;

  const filter = {};
  if (jobId) {
    filter.job = jobId;
  }

  const applications = await JobApplication.find(filter)
    .populate("job", "title department location type")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: applications.length,
    data: {
      applications,
    },
  });
});

// Update application status/notes (admin)
const updateApplication = catchAsync(async (req, res, next) => {
  const { status, notes } = req.body;

  const updateData = {};
  if (status) updateData.status = status;
  if (notes !== undefined) updateData.notes = notes;

  const application = await JobApplication.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate("job", "title department");

  if (!application) {
    return next(new AppError("No application found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      application,
    },
  });
});

// Delete application (admin)
const deleteApplication = catchAsync(async (req, res, next) => {
  const application = await JobApplication.findByIdAndDelete(req.params.id);

  if (!application) {
    return next(new AppError("No application found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllJobs,
  getJob,
  applyForJob,
  adminGetAllJobs,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  adminGetAllApplications,
  updateApplication,
  deleteApplication,
};
