const express = require("express");
const router = express.Router();
const {
  getMyBusinessProfile,
  createBusinessProfile,
  updateBusinessProfile,
} = require("../controllers/businessController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, getMyBusinessProfile);
router.post("/profile", protect, createBusinessProfile);
router.put("/profile", protect, updateBusinessProfile);

module.exports = router;
