/**
 * Express Application for Firebase Cloud Functions
 * Adapted from server.js for serverless environment
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// Load environment variables from Firebase config
require("dotenv").config();

const connectDB = require("./config/database");
const globalErrorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");
const logger = require("./utils/logger");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const countryRoutes = require("./routes/countryRoutes");
const tourRoutes = require("./routes/tourRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// Connect to MongoDB - This uses connection pooling for serverless
let isConnected = false;
const ensureDbConnection = async () => {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
};

// Middleware to ensure DB connection before any request
app.use(async (req, res, next) => {
    try {
        await ensureDbConnection();
        next();
    } catch (error) {
        next(new AppError("Database connection failed", 500));
    }
});

// Trust proxy for rate limiting in Cloud Functions
app.set("trust proxy", 1);

// Global middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses

// Rate limiting (adjusted for serverless)
const limiter = rateLimit({
    max: process.env.MAX_REQUESTS_PER_HOUR || 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many requests from this IP, please try again in an hour!",
    standardHeaders: true,
    legacyHeaders: false,
    // Use memory store (works in serverless, but resets on cold starts)
    // For production, consider using redis or firebase realtime database
});
app.use("/api", limiter);

// CORS configuration
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:3000",
    "https://nothingbutadventures.web.app",
    "https://nothingbutadventures.firebaseapp.com",
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// Logging (minimal in production for cost)
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            "duration",
            "ratingsQuantity",
            "ratingsAverage",
            "maxGroupSize",
            "difficulty",
            "price",
        ],
    })
);

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Nothing But Adventures API is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "production",
    });
});

// Root route
app.get("/", (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Welcome to Nothing But Adventures API",
        version: "1.0.0",
        documentation: "/api/v1",
    });
});

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/countries", countryRoutes);
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/reviews", reviewRoutes);

// Handle undefined routes
app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
