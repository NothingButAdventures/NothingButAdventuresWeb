const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("../models/Country");
const Tour = require("../models/Tour");

const path = require("path");
dotenv.config({ path: path.join(__dirname, "../.env") });

const DB = process.env.MONGODB_URI;

mongoose
  .connect(DB)
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.log("DB connection error:", err));

const generateTourCode = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let res = "";
    for (let i = 0; i < 5; i++) {
        res += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return res;
};

const migrateTourCodes = async () => {
  try {
    // Find ALL tours to force regenerate codes for the new 5-alphabet format
    const tours = await Tour.find();
    console.log(`Found ${tours.length} tours to update.`);

    for (const tour of tours) {
      let unique = false;
      let code = "";
      while (!unique) {
        code = generateTourCode();
        const existingTour = await Tour.findOne({ tourCode: code });
        if (!existingTour) {
          unique = true;
        }
      }
      tour.tourCode = code;
      await tour.save({ validateBeforeSave: false }); // Bypass new validation for legacy records if needed
      console.log(`Updated tour: ${tour.name} with code: ${code}`);
    }

    console.log("Migration completed!");
    process.exit();
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrateTourCodes();
