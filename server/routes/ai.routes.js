const express = require("express");
const router = express.Router();
const { predictSurplus } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// AI Prediction route (Protected: only logged-in businesses should access this)
router.post("/predict", protect, predictSurplus);

module.exports = router;

