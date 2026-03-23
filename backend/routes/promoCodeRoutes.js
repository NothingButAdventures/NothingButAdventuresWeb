const express = require("express");
const promoCodeController = require("../controllers/promoCodeController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Public routes - none for promo codes (all require auth)

// Protected routes (user must be logged in)
router.post("/apply", protect, promoCodeController.applyPromoCode);
router.get("/check/:tourId", protect, promoCodeController.checkPromoStatus);

// Admin routes
router
    .route("/")
    .get(promoCodeController.getAllPromoCodes)
    .post(promoCodeController.createPromoCode);

router
    .route("/:id")
    .get(promoCodeController.getPromoCode)
    .patch(promoCodeController.updatePromoCode)
    .delete(promoCodeController.deletePromoCode);

module.exports = router;
