const express = require("express");
const {
  createInstallmentPlan,
  activateInstallmentSubscription,
  syncInstallmentStatus,
  handlePayPalWebhook,
  getInstallmentPreview,
} = require("../controllers/installmentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public: PayPal webhook (no auth — PayPal calls this directly)
router.post("/webhook", handlePayPalWebhook);

// Public: Preview installment plan (used by checkout page)
router.get("/preview", getInstallmentPreview);

// Protected routes
router.use(protect);

router.post("/create-plan", createInstallmentPlan);
router.post("/activate", activateInstallmentSubscription);
router.get("/:bookingId/sync", syncInstallmentStatus);

module.exports = router;
