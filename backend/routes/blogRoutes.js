const express = require("express");
const {
    getAllBlogs,
    getBlog,
    getFeaturedBlogs,
    getBlogsByCategory,
    getCategories,
    searchBlogs,
    getMyBlogs,
    getMyBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    adminGetAllBlogs,
    toggleFeatured,
} = require("../controllers/blogController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", getAllBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/categories", getCategories);
router.get("/search", searchBlogs);
router.get("/category/:category", getBlogsByCategory);
router.get("/:slug", getBlog);

// Protected routes - copywriter and admin
router.use(protect);
router.use(restrictTo("copywriter", "admin"));

router.get("/me/blogs", getMyBlogs);
router.get("/me/blogs/:id", getMyBlog);
router.post("/", createBlog);
router.patch("/:id", updateBlog);
router.delete("/:id", deleteBlog);

// Admin only routes
router.use(restrictTo("admin"));
router.get("/admin/all", adminGetAllBlogs);
router.patch("/:id/toggle-featured", toggleFeatured);

module.exports = router;
