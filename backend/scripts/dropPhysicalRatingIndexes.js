const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, "../.env") });

const connectDB = require("../config/database");

const dropIndexes = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();

    const physicalRatingsCollection = mongoose.connection.collection("physicalratings");
    
    console.log("Dropping unique indexes on physicalratings collection...");
    
    // Drop specific indexes
    try {
      await physicalRatingsCollection.dropIndex("level_1");
      console.log("✅ Dropped index: level_1");
    } catch (err) {
      console.log("⚠️  Index level_1 not found or already dropped");
    }

    try {
      await physicalRatingsCollection.dropIndex("name_1");
      console.log("✅ Dropped index: name_1");
    } catch (err) {
      console.log("⚠️  Index name_1 not found or already dropped");
    }

    try {
      await physicalRatingsCollection.dropIndex("slug_1");
      console.log("✅ Dropped index: slug_1");
    } catch (err) {
      console.log("⚠️  Index slug_1 not found or already dropped");
    }

    console.log("\n✅ Cleanup complete! Physical ratings can now have duplicate names, levels, and slugs.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error dropping indexes:", err);
    process.exit(1);
  }
};

dropIndexes();
