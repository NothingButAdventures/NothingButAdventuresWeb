/**
 * Nothing But Adventures - Backend API
 * Firebase Cloud Functions Entry Point
 * 
 * This file wraps the Express app as a Firebase Cloud Function
 */

const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

// Set global options for all functions
setGlobalOptions({
    region: "asia-south1", // Mumbai region for best latency in India
    maxInstances: 10,
    memory: "512MiB",
    timeoutSeconds: 60,
});

// Import the Express app
const app = require("./src/app");

// Export the Express app as a Cloud Function
// This function handles all API requests at /api/*
exports.api = onRequest(
    {
        cors: true, // Enable CORS
        invoker: "public", // Allow public access
    },
    app
);
