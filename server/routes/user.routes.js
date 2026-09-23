const express = require("express");
const router = express.Router();
const {
  getCurrentUser,
  syncUser,
  getUsers,
  getUserByUid,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/authMiddleware");

// Protected User Sync & Profile Routes
router.post("/sync", protect, syncUser);
router.get("/me", protect, getCurrentUser);

// General User Routes
router.get("/", getUsers);
router.get("/:uid", getUserByUid);

module.exports = router;
