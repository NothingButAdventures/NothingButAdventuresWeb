const express = require("express");
const {
  getAllActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getAllActivities);
router.get("/:id", getActivity);

// Protected routes (Admin only for CRUD)
router.use(protect);
router.use(restrictTo("admin"));

router.post("/", createActivity);
router.patch("/:id", updateActivity);
router.delete("/:id", deleteActivity);

module.exports = router;
