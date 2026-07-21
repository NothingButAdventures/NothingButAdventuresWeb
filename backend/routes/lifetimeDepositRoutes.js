const express = require("express");
const {
  getMyLifetimeDeposits,
  validateLifetimeDeposit,
} = require("../controllers/lifetimeDepositController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/my-deposits", getMyLifetimeDeposits);
router.post("/validate", validateLifetimeDeposit);

module.exports = router;
