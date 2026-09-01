const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const {
  applyForAffiliate,
  getMyAffiliateProfile,
  getMyReferrals,
  getMyPayouts,
  trackReferralClick,
  getAllAffiliates,
  getAffiliateStats,
  getAffiliateById,
  approveAffiliate,
  rejectAffiliate,
  suspendAffiliate,
  updateCommissionRate,
  processAffiliatePayout,
} = require("../controllers/affiliateController");

// ─── Public ────────────────────────────────────────────────────────────────────
// Track referral click (no auth needed)
router.get("/track/:code", trackReferralClick);

// ─── Authenticated User ────────────────────────────────────────────────────────
router.post("/apply", protect, applyForAffiliate);
router.get("/me", protect, getMyAffiliateProfile);
router.get("/me/referrals", protect, getMyReferrals);
router.get("/me/payouts", protect, getMyPayouts);

// ─── Admin Only ────────────────────────────────────────────────────────────────
router.get("/stats", protect, restrictTo("admin"), getAffiliateStats);
router.get("/", protect, restrictTo("admin"), getAllAffiliates);
router.get("/:id", protect, restrictTo("admin"), getAffiliateById);
router.patch("/:id/approve", protect, restrictTo("admin"), approveAffiliate);
router.patch("/:id/reject", protect, restrictTo("admin"), rejectAffiliate);
router.patch("/:id/suspend", protect, restrictTo("admin"), suspendAffiliate);
router.patch("/:id/commission", protect, restrictTo("admin"), updateCommissionRate);
router.post("/:id/payout", protect, restrictTo("admin"), processAffiliatePayout);

module.exports = router;
