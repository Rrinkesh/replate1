const express = require("express");
const router = express.Router();
const { upload } = require("../services/uploadService");
const { protect } = require("../middleware/authMiddleware");

/**
 * @desc    Upload single image
 * @route   POST /api/uploads
 * @access  Private
 */
router.post("/", protect, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(new Error(err.message));
    }

    if (!req.file) {
      res.status(400);
      return next(new Error("Please upload an image file"));
    }

    // Construct public URL
    const protocol = req.protocol;
    const host = req.get("host");
    const fullUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.status(200).json({
      success: true,
      url: fullUrl,
    });
  });
});

module.exports = router;
