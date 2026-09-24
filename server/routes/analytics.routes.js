const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  getBusinessAnalytics,
  getRecipientAnalytics,
  getAdminAnalytics,
  getGlobalImpact,
} = require("../controllers/analyticsController");

// Public impact data
router.get("/impact", getGlobalImpact);

// All other analytics endpoints require authenticated Firebase user
router.use(protect);

router.get("/business", getBusinessAnalytics);
router.get("/recipient", getRecipientAnalytics);
router.get("/admin", getAdminAnalytics);

module.exports = router;
