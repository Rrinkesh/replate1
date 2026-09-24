const mongoose = require("mongoose");

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
