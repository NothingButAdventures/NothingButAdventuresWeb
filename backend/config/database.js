const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Cache the database connection for Cloud Functions
let cachedConnection = null;

const connectDB = async () => {
  // Reuse existing connection if available (important for Cloud Functions)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    logger.info('Using cached MongoDB connection');
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Optimize for Cloud Functions
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    });

    cachedConnection = conn;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
      cachedConnection = null; // Clear cache on error
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      cachedConnection = null; // Clear cache on disconnect
    });

    // Graceful shutdown (only for non-Cloud Functions environment)
    if (require.main === module || process.env.NODE_ENV !== 'production') {
      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          logger.info('MongoDB connection closed through app termination');
          process.exit(0);
        } catch (error) {
          logger.error('Error closing MongoDB connection:', error);
          process.exit(1);
        }
      });
    }

    return conn;
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    console.error('❌ MongoDB connection failed:', error.message);
    cachedConnection = null;

    // Don't exit in Cloud Functions, throw error instead
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;