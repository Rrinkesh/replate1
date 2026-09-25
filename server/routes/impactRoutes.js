const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getMyImpact, requestReward } = require("../controllers/impactController");

router.use(protect);

router.get("/me", getMyImpact);
router.post("/rewards/request", requestReward);

module.exports = router;
