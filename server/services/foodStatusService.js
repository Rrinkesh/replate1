const Food = require("../models/Food");
const { createNotificationHelper } = require("../utils/notificationUtils");

const EXPIRY_THRESHOLDS = {
  ALMOST_EXPIRED_MS: 1 * 60 * 60 * 1000, // 1 Hour in milliseconds
  EXPIRING_SOON_MS: 3 * 60 * 60 * 1000, // 3 Hours in milliseconds
};

const calculateFoodStatus = (food) => {
  if (!food) return "AVAILABLE";

  // Expired takes priority if expiry time has passed
  if (food.expiryTime) {
    const now = Date.now();
    const expiry = new Date(food.expiryTime).getTime();
    const diff = expiry - now;

    if (diff <= 0) {
      return "EXPIRED";
    }

    if (food.quantity <= 0) {
      return "SOLD_OUT";
    }

    if (diff <= EXPIRY_THRESHOLDS.ALMOST_EXPIRED_MS) {
      return "ALMOST_EXPIRED";
    }

    if (diff <= EXPIRY_THRESHOLDS.EXPIRING_SOON_MS) {
      return "EXPIRING_SOON";
    }
  } else if (food.quantity <= 0) {
    return "SOLD_OUT";
  }

  return "AVAILABLE";
};

const updateExpiredAndExpiringFoodListings = async () => {
  try {
    const activeListings = await Food.find({
      status: { $ne: "EXPIRED" },
    });

    let updatedCount = 0;
    const now = new Date();

    for (const food of activeListings) {
      const computedStatus = calculateFoodStatus(food);

      if (computedStatus !== food.status) {
        const prevStatus = food.status;
        
        if (computedStatus === "EXPIRED") {
          // Auto-delete expired food from database as requested
          await Food.findByIdAndDelete(food._id);
          updatedCount++;

          await createNotificationHelper({
            userId: food.businessId,
            type: "FOOD_EXPIRED",
            title: "Surplus Food Expired & Removed",
            message: `Your surplus food listing "${food.name}" has reached its pickup deadline and was automatically removed from the active listings.`,
            relatedId: null, // Removed so no related ID
          });
        } else {
          food.status = computedStatus;
          await food.save();
          updatedCount++;

          if (
            computedStatus === "EXPIRING_SOON" &&
            prevStatus === "AVAILABLE"
          ) {
          await createNotificationHelper({
            userId: food.businessId,
            type: "FOOD_EXPIRING",
            title: "Food Listing Expiring Soon",
            message: `Your listing "${food.name}" expires in less than 3 hours. Consider lowering price or confirming claims.`,
            relatedId: food._id,
          });
          }
        }
      }
    }

    if (updatedCount > 0) {
      console.log(
        `[ExpiryJob] Updated status for ${updatedCount} food listings at ${now.toLocaleTimeString()}`,
      );
    }

    return updatedCount;
  } catch (error) {
    console.error(
      "[ExpiryJob Error] Failed to update food statuses:",
      error.message,
    );
    return 0;
  }
};

module.exports = {
  calculateFoodStatus,
  updateExpiredAndExpiringFoodListings,
  EXPIRY_THRESHOLDS,
};
