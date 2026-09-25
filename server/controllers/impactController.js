const ImpactLedger = require("../models/ImpactLedger");
const User = require("../models/User");
const RewardRequest = require("../models/RewardRequest");
const { protect } = require("../middleware/authMiddleware");

const getAuthenticatedUser = async (req) => {
  const firebaseUid = req.user?.uid || req.user?.firebaseUid;
  if (!firebaseUid) {
    const err = new Error("Unauthorized - Firebase user token missing");
    err.statusCode = 401;
    throw err;
  }
  const mongoUser = await User.findOne({ firebaseUid });
  if (!mongoUser) {
    const err = new Error("User not found in MongoDB");
    err.statusCode = 404;
    throw err;
  }
  return mongoUser;
};

// @desc    Get user's impact stats and ledger
// @route   GET /api/impact/me
// @access  Private
const getMyImpact = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);
    
    const user = await User.findById(mongoUser._id).select(
      "impactCredits trustScore totalCompletedOrders totalFoodRescuedKg rewardLevel"
    );

    const ledger = await ImpactLedger.find({ userId: mongoUser._id })
      .sort({ createdAt: -1 })
      .limit(50); // Get recent 50

    const activeRequests = await RewardRequest.find({ userId: mongoUser._id });

    res.status(200).json({
      success: true,
      stats: user,
      ledger,
      activeRequests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request a reward (Featured Placement or Fundraising)
// @route   POST /api/impact/rewards/request
// @access  Private
const requestReward = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);
    const { type, details } = req.body;
    
    // Determine cost based on type
    let requiredCredits = 0;
    if (type === "FEATURED_PLACEMENT") requiredCredits = 500;
    if (type === "FUNDRAISING_CAMPAIGN") requiredCredits = 1000;

    const user = await User.findById(mongoUser._id);
    if (user.impactCredits < requiredCredits) {
      res.status(400);
      throw new Error(`Insufficient Impact Credits. You need ${requiredCredits} for this reward.`);
    }

    // Deduct credits and log
    user.impactCredits -= requiredCredits;
    await user.save();

    await ImpactLedger.create({
      userId: mongoUser._id,
      type: "SPENT",
      amount: -requiredCredits,
      reason: `Redeemed reward: ${type.replace("_", " ")}`,
    });

    // Create Request for Admin Approval
    const request = await RewardRequest.create({
      userId: mongoUser._id,
      type,
      creditsSpent: requiredCredits,
      details,
    });

    res.status(201).json({
      success: true,
      message: "Reward requested successfully. Pending Admin approval.",
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyImpact,
  requestReward,
};
