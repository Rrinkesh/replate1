const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Load Environment Variables FIRST before importing anything else
dotenv.config();

const connectDB = require("./config/db");

// Import Middleware
const { notFound, errorHandler } = require("./middleware/error.middleware");

// Import Route Modules
const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const foodRoutes = require("./routes/foodRoutes");
const businessRoutes = require("./routes/businessRoutes");
const recipientRoutes = require("./routes/recipientRoutes");
const reservationRoutes = require("./routes/reservation.routes");
const adminRoutes = require("./routes/adminRoutes");
const analyticsRoutes = require("./routes/analytics.routes");
const notificationRoutes = require("./routes/notification.routes");
const aiRoutes = require("./routes/ai.routes");
const uploadRoutes = require("./routes/uploadRoutes");
const path = require("path");

// Import Background Job Modules
const { startExpiryBackgroundJob } = require("./jobs/expiryJob");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
connectDB();

// Global Express Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API Domain Routes
app.use("/api", healthRoutes);
app.use("/api/debug", require("./routes/debug.routes"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/recipients", recipientRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/uploads", uploadRoutes);

// Root Welcome Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to RePlate API Platform",
    tagline: "Good food deserves another plate.",
  });
});

// Centralized 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Express Server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`RePlate Express Server running on port ${PORT}`);
  // Start food status & expiry monitor background job
  startExpiryBackgroundJob();
});
