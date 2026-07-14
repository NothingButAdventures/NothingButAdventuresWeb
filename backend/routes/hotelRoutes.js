const express = require("express");
const {
  getAllHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotelController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getAllHotels);
router.get("/:id", getHotel);

// Protected routes (Admin only for CRUD)
router.use(protect);
router.use(restrictTo("admin"));

router.post("/", createHotel);
router.patch("/:id", updateHotel);
router.delete("/:id", deleteHotel);

module.exports = router;
