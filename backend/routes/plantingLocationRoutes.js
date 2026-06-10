const express = require("express");
const {
  getAllPlantingLocations,
  getPlantingLocation,
  createPlantingLocation,
  updatePlantingLocation,
  deletePlantingLocation,
} = require("../controllers/plantingLocationController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getAllPlantingLocations);
router.get("/:id", getPlantingLocation);

// Protected routes (admin only)
router.use(protect);
router.use(restrictTo("admin"));

router.post("/", createPlantingLocation);
router.patch("/:id", updatePlantingLocation);
router.delete("/:id", deletePlantingLocation);

module.exports = router;
