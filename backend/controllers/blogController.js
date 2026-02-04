const Blog = require("../models/Blog");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// Get all published blogs (public)
const getAllBlogs = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
        Blog.find({ status: "published" }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const blogs = await features.query
        .populate("author", "name avatar")
        .populate("relatedCountries", "name slug");

    const total = await Blog.countDocuments({ status: "published" });

    res.status(200).json({
        status: "success",
        results: blogs.length,
        total,
        data: {
            blogs,
        },
    });
});

// Get single blog by slug (public)
const getBlog = catchAsync(async (req, res, next) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: "published" })
        .populate("author", "name avatar")
        .populate("relatedCountries", "name slug")
        .populate("relatedTours", "name slug price images");

    if (!blog) {
        return next(new AppError("No blog post found with that slug", 404));
    }

    // Increment view count
    await blog.incrementViewCount();

    res.status(200).json({
        status: "success",
        data: {
            blog,
        },
    });
});

// Get featured blogs (public)
const getFeaturedBlogs = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 5;
    const blogs = await Blog.getFeaturedBlogs(limit);

    res.status(200).json({
        status: "success",
        results: blogs.length,
        data: {
            blogs,
        },
    });
});

// Get blogs by category (public)
const getBlogsByCategory = catchAsync(async (req, res, next) => {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const features = new APIFeatures(
        Blog.find({ status: "published", category }),
        req.query
    )
        .sort()
        .limitFields()
        .paginate();

    const blogs = await features.query.populate("author", "name avatar");
    const total = await Blog.countDocuments({ status: "published", category });

    res.status(200).json({
        status: "success",
        results: blogs.length,
        total,
        data: {
            blogs,
        },
    });
});

// Get all categories with counts (public)
const getCategories = catchAsync(async (req, res, next) => {
    const categories = await Blog.aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);

    res.status(200).json({
        status: "success",
        data: {
            categories,
        },
    });
});

// Search blogs (public)
const searchBlogs = catchAsync(async (req, res, next) => {
    const { q, category, tag } = req.query;

    const query = { status: "published" };

    if (q) {
        query.$text = { $search: q };
    }

    if (category) {
        query.category = category;
    }

    if (tag) {
        query.tags = { $in: [tag] };
    }

    const features = new APIFeatures(Blog.find(query), req.query)
        .sort()
        .limitFields()
        .paginate();

    const blogs = await features.query.populate("author", "name avatar");
    const total = await Blog.countDocuments(query);

    res.status(200).json({
        status: "success",
        results: blogs.length,
        total,
        data: {
            blogs,
        },
    });
});

// Get my blogs (copywriter/admin)
const getMyBlogs = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(
        Blog.find({ author: req.user._id }),
        req.query
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const blogs = await features.query;
    const total = await Blog.countDocuments({ author: req.user._id });

    res.status(200).json({
        status: "success",
        results: blogs.length,
        total,
        data: {
            blogs,
        },
    });
});

// Get single blog for editing (copywriter/admin)
const getMyBlog = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    let query = { _id: id };

    // If not admin, restrict to own blogs
    if (req.user.role !== "admin") {
        query.author = req.user._id;
    }

    const blog = await Blog.findOne(query)
        .populate("author", "name avatar")
        .populate("relatedCountries", "name slug")
        .populate("relatedTours", "name slug");

    if (!blog) {
        return next(new AppError("No blog post found or you do not have permission", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            blog,
        },
    });
});

// Create blog (copywriter/admin)
const createBlog = catchAsync(async (req, res, next) => {
    // Set author to current user
    req.body.author = req.user._id;

    const newBlog = await Blog.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            blog: newBlog,
        },
    });
});

// Update blog (copywriter can only update own, admin can update any)
const updateBlog = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    let query = { _id: id };

    // If not admin, restrict to own blogs
    if (req.user.role !== "admin") {
        query.author = req.user._id;
    }

    const blog = await Blog.findOneAndUpdate(query, req.body, {
        new: true,
        runValidators: true,
    });

    if (!blog) {
        return next(new AppError("No blog post found or you do not have permission", 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            blog,
        },
    });
});

// Delete blog (copywriter can only delete own, admin can delete any)
const deleteBlog = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    let query = { _id: id };

    // If not admin, restrict to own blogs
    if (req.user.role !== "admin") {
        query.author = req.user._id;
    }

    const blog = await Blog.findOneAndDelete(query);

    if (!blog) {
        return next(new AppError("No blog post found or you do not have permission", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});

// Admin: Get all blogs including drafts
const adminGetAllBlogs = catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Blog.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const blogs = await features.query.populate("author", "name avatar email");
    const total = await Blog.countDocuments();

    res.status(200).json({
        status: "success",
        results: blogs.length,
        total,
        data: {
            blogs,
        },
    });
});

// Admin: Toggle featured status
const toggleFeatured = catchAsync(async (req, res, next) => {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
        return next(new AppError("No blog post found with that ID", 404));
    }

    blog.isFeatured = !blog.isFeatured;
    await blog.save({ validateBeforeSave: false });

    res.status(200).json({
        status: "success",
        data: {
            blog,
        },
    });
});

module.exports = {
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
};
