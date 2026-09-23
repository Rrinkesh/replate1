const mongoose = require("mongoose");

/**
 * MongoDB Atlas Connection Configuration
 * Uses MONGODB_URI environment variable from server/.env
 */
const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;

    if (!connStr || connStr.trim() === "") {
      console.warn(
        "MongoDB Warning: MONGODB_URI not provided in .env. Database connection skipped.",
      );
      return;
    }

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Non-fatal exit during dev if DB URI is not configured yet
  }
};

module.exports = connectDB;
