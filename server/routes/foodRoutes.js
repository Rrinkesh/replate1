const express = require("express");
const router = express.Router();
const {
  createFood,
  getFoodListings,
  getMyFoodListings,
  getFoodById,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");
const { protect, verifiedOnly, optionalAuth } = require("../middleware/authMiddleware");

// Food Listings CRUD Routes
router.route("/").get(optionalAuth, getFoodListings).post(protect, verifiedOnly, createFood);

router.route("/me/listings").get(protect, getMyFoodListings);

router
  .route("/:id")
  .get(getFoodById)
  .put(protect, verifiedOnly, updateFood)
  .delete(protect, verifiedOnly, deleteFood);

module.exports = router;
