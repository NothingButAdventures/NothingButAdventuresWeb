const express = require("express");
const {
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
} = require("../controllers/jobController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// ─────────────────────────────────────────────
// ADMIN SPECIFIC ROUTES (Must come before wildcard :id)
// ─────────────────────────────────────────────
router.get("/admin/all", protect, restrictTo("admin"), adminGetAllJobs);
router.get("/admin/applications", protect, restrictTo("admin"), adminGetAllApplications);
router.patch("/admin/applications/:id", protect, restrictTo("admin"), updateApplication);
router.delete("/admin/applications/:id", protect, restrictTo("admin"), deleteApplication);
router.post("/admin/create", protect, restrictTo("admin"), createJob);

// Protected Admin CRUD
router.post("/", protect, restrictTo("admin"), createJob);
router.patch("/:id/status", protect, restrictTo("admin"), toggleJobStatus);
router.patch("/:id", protect, restrictTo("admin"), updateJob);
router.delete("/:id", protect, restrictTo("admin"), deleteJob);

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────
router.get("/", getAllJobs);
router.post("/:jobId/apply", applyForJob);
router.get("/:id", getJob);

module.exports = router;
