const express = require("express");
const discountController = require("../controllers/discountController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", discountController.getAllDiscounts);
router.get("/active", discountController.getActiveDiscounts);
router.get("/slug/:slug", discountController.getDiscountBySlug);
router.get("/:id", discountController.getDiscount);

// Admin only routes
router
    .route("/")
    .post(discountController.createDiscount);

router
    .route("/:id")
    .patch(discountController.updateDiscount)
    .delete(discountController.deleteDiscount);

module.exports = router;
