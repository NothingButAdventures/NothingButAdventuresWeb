const mongoose = require("mongoose");
const slugify = require("slugify");

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "A blog post must have a title"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        slug: {
            type: String,
            unique: true,
        },
        content: {
            type: String,
            required: [true, "A blog post must have content"],
        },
        excerpt: {
            type: String,
            maxlength: [500, "Excerpt cannot exceed 500 characters"],
        },
        featuredImage: {
            url: {
                type: String,
                required: [true, "A blog post must have a featured image"],
            },
            caption: String,
            alt: String,
        },
        author: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: [true, "A blog post must have an author"],
        },
        category: {
            type: String,
            enum: [
                "Active Travel",
                "Food & Drink",
                "Guides",
                "Wildlife",
                "Culture",
                "Adventure",
                "Photography",
                "Tips & Tricks",
                "Destinations",
                "Stories",
                "Other",
            ],
            default: "Other",
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        status: {
            type: String,
            enum: ["draft", "published", "archived"],
            default: "draft",
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        readTime: {
            type: Number, // in minutes
            default: 5,
        },
        publishedAt: {
            type: Date,
        },
        metaTitle: {
            type: String,
            maxlength: [60, "Meta title cannot exceed 60 characters"],
        },
        metaDescription: {
            type: String,
            maxlength: [160, "Meta description cannot exceed 160 characters"],
        },
        relatedCountries: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Country",
            },
        ],
        relatedTours: [
            {
                type: mongoose.Schema.ObjectId,
                ref: "Tour",
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isFeatured: 1 });
blogSchema.index({ "$**": "text" });

// Pre-save middleware to generate slug
blogSchema.pre("save", function (next) {
    if (this.isModified("title") || this.isNew) {
        const baseSlug = slugify(this.title, { lower: true, strict: true });
        this.slug = `${baseSlug}-${Date.now().toString(36)}`;
    }
    next();
});

// Pre-save middleware to calculate read time
blogSchema.pre("save", function (next) {
    if (this.isModified("content")) {
        // Average reading speed: 200 words per minute
        const wordCount = this.content
            .replace(/<[^>]*>/g, "") // Remove HTML tags
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
        this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    }
    next();
});

// Pre-save middleware to set publishedAt when status changes to published
blogSchema.pre("save", function (next) {
    if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

// Static method to get featured blogs
blogSchema.statics.getFeaturedBlogs = async function (limit = 5) {
    return this.find({ status: "published", isFeatured: true })
        .sort("-publishedAt")
        .limit(limit)
        .populate("author", "name avatar")
        .select("title slug excerpt featuredImage category readTime publishedAt tags");
};

// Static method to get blogs by category
blogSchema.statics.getBlogsByCategory = async function (category, limit = 10) {
    return this.find({ status: "published", category })
        .sort("-publishedAt")
        .limit(limit)
        .populate("author", "name avatar")
        .select("title slug excerpt featuredImage category readTime publishedAt tags");
};

// Instance method to increment view count
blogSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    await this.save({ validateBeforeSave: false });
};

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
