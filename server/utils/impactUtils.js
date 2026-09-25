const ImpactLedger = require("../models/ImpactLedger");
const User = require("../models/User");
const SystemSettings = require("../models/SystemSettings");

// Default thresholds if not in DB
const DEFAULT_THRESHOLDS = {
  COMMUNITY_PARTNER: 100,
  FOOD_RESCUE_PARTNER: 500,
  REPLATE_CHAMPION: 1000,
};

const getThresholds = async () => {
  try {
    const settings = await SystemSettings.findOne({ key: "REWARD_THRESHOLDS" });
    return settings ? settings.value : DEFAULT_THRESHOLDS;
  } catch (err) {
    return DEFAULT_THRESHOLDS;
  }
};

const determineRewardLevel = (credits, thresholds) => {
  if (credits >= thresholds.REPLATE_CHAMPION) return "REPLATE_CHAMPION";
  if (credits >= thresholds.FOOD_RESCUE_PARTNER) return "FOOD_RESCUE_PARTNER";
  if (credits >= thresholds.COMMUNITY_PARTNER) return "COMMUNITY_PARTNER";
  return "NEW";
};

const processOrderCompletionRewards = async (reservation, food) => {
  try {
    // 1. Calculate impact credits based on quantity (e.g. 10 base + 5 per qty)
    const baseCredits = 10;
    const creditsPerQty = 5;
    const earnedCredits = baseCredits + (reservation.quantity * creditsPerQty);

    const thresholds = await getThresholds();

    // Helper to process individual user
    const processUserReward = async (userId, userType) => {
      // Check for duplicate reward (anti-gaming)
      const existing = await ImpactLedger.findOne({
        userId,
        reservationId: reservation._id,
        type: "EARNED"
      });

      if (existing) return; // Already rewarded

      // 1. Create Ledger Entry
      await ImpactLedger.create({
        userId,
        reservationId: reservation._id,
        type: "EARNED",
        amount: earnedCredits,
        reason: `Completed order for ${reservation.quantity} ${food.quantityUnit || 'items'} of ${food.name}`
      });

      // 2. Update User Stats
      const user = await User.findById(userId);
      if (!user) return;

      user.impactCredits += earnedCredits;
      user.trustScore = Math.min(100, user.trustScore + 2); // Max 100
      user.totalCompletedOrders += 1;
      
      // Rough estimation of kg if not specified (assume 1 item/serving = 0.5kg)
      const kgEstimate = food.quantityUnit === 'kg' ? reservation.quantity : reservation.quantity * 0.5;
      user.totalFoodRescuedKg += kgEstimate;

      // 3. Upgrade Reward Level
      const newLevel = determineRewardLevel(user.impactCredits, thresholds);
      if (newLevel !== user.rewardLevel) {
        user.rewardLevel = newLevel;
      }

      await user.save();
    };

    // Process for BOTH Business and Recipient
    await Promise.all([
      processUserReward(reservation.businessId, "BUSINESS"),
      processUserReward(reservation.recipientId, "RECIPIENT")
    ]);

  } catch (error) {
    console.error("Impact Reward Processing Error:", error);
    // We don't throw, so we don't break the reservation completion flow
  }
};

const processOrderCancellationPenalty = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    
    // Penalize trust score for cancellation
    user.trustScore = Math.max(0, user.trustScore - 5); // Min 0
    await user.save();
  } catch (error) {
    console.error("Impact Penalty Processing Error:", error);
  }
};

module.exports = {
  processOrderCompletionRewards,
  processOrderCancellationPenalty,
  getThresholds,
  determineRewardLevel
};
