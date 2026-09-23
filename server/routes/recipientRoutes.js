const express = require("express");
const router = express.Router();
const {
  getMyRecipientProfile,
  createRecipientProfile,
  updateRecipientProfile,
} = require("../controllers/recipientController");
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, getMyRecipientProfile);
router.post("/profile", protect, createRecipientProfile);
router.put("/profile", protect, updateRecipientProfile);

module.exports = router;
