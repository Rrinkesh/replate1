const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth API foundation ready (Firebase handled client-side)",
  });
});

module.exports = router;
