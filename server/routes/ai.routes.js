const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Surplus Forecasting API foundation ready — Coming Soon",
  });
});

module.exports = router;
