const Food = require("../models/Food");
const Reservation = require("../models/Reservation");
const BusinessProfile = require("../models/BusinessProfile");
const RecipientProfile = require("../models/RecipientProfile");
const User = require("../models/User");

const getAuthenticatedUser = async (req) => {
  const firebaseUid = req.user?.uid || req.user?.firebaseUid;
  if (!firebaseUid) {
    const err = new Error("Unauthorized - Firebase user token missing");
    err.statusCode = 401;
    throw err;
  }
  let mongoUser = await User.findOne({ firebaseUid });
  if (!mongoUser) {
    mongoUser = await User.create({
      firebaseUid,
      email: req.user.email || "user@replate.org",
      name: req.user.name || "RePlate User",
      role: "RECIPIENT",
    });
  }
  return mongoUser;
};

const getStartDateFromTimeframe = (timeframe) => {
  const now = new Date();
  switch (timeframe) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "all":
      return new Date(0);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
};

const getBusinessAnalytics = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);

    if (mongoUser.role !== "BUSINESS" && mongoUser.role !== "ADMIN") {
      res.status(403);
      throw new Error(
        "Forbidden - Only business accounts can view business analytics",
      );
    }

    const { timeframe = "30d" } = req.query;
    const startDate = getStartDateFromTimeframe(timeframe);

    const totalFoodListed = await Food.countDocuments({
      businessId: mongoUser._id,
      createdAt: { $gte: startDate },
    });

    const activeListings = await Food.countDocuments({
      businessId: mongoUser._id,
      status: { $in: ["AVAILABLE", "EXPIRING_SOON", "ALMOST_EXPIRED"] },
      quantity: { $gt: 0 },
    });

    const reservationMatch = {
      businessId: mongoUser._id,
      createdAt: { $gte: startDate },
    };

    const totalReservations =
      await Reservation.countDocuments(reservationMatch);

    const completedReservations = await Reservation.countDocuments({
      ...reservationMatch,
      status: "COMPLETED",
    });

    const cancelledReservations = await Reservation.countDocuments({
      ...reservationMatch,
      status: "CANCELLED",
    });

    // Aggregations: Total Meals Rescued & Revenue Recovered
    const rescuedAggregate = await Reservation.aggregate([
      {
        $match: {
          businessId: mongoUser._id,
          status: "COMPLETED",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalMeals: { $sum: "$quantity" },
        },
      },
    ]);
    const totalQuantityRescued = rescuedAggregate[0]?.totalMeals || 0;

    const valueAggregate = await Reservation.aggregate([
      {
        $match: {
          businessId: mongoUser._id,
          status: { $ne: "CANCELLED" },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$totalPrice" },
        },
      },
    ]);
    const totalValueRecovered = valueAggregate[0]?.totalValue || 0;

    // Daily trends aggregation for charts
    const dailyTrends = await Reservation.aggregate([
      {
        $match: {
          businessId: mongoUser._id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          meals: { $sum: "$quantity" },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      timeframe,
      metrics: {
        totalFoodListed,
        activeListings,
        totalReservations,
        completedReservations,
        cancelledReservations,
        totalQuantityRescued,
        totalValueRecovered,
      },
      dailyTrends,
    });
  } catch (error) {
    next(error);
  }
};

const getRecipientAnalytics = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);

    const { timeframe = "30d" } = req.query;
    const startDate = getStartDateFromTimeframe(timeframe);

    const reservationMatch = {
      recipientId: mongoUser._id,
      createdAt: { $gte: startDate },
    };

    const totalReservations =
      await Reservation.countDocuments(reservationMatch);

    const completedReservations = await Reservation.countDocuments({
      ...reservationMatch,
      status: "COMPLETED",
    });

    const cancelledReservations = await Reservation.countDocuments({
      ...reservationMatch,
      status: "CANCELLED",
    });

    // Aggregations: Meals Rescued & Cost Saved
    const rescuedAggregate = await Reservation.aggregate([
      {
        $match: {
          recipientId: mongoUser._id,
          status: "COMPLETED",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalMeals: { $sum: "$quantity" },
        },
      },
    ]);
    const totalQuantityRescued = rescuedAggregate[0]?.totalMeals || 0;

    const valueAggregate = await Reservation.aggregate([
      {
        $match: {
          recipientId: mongoUser._id,
          status: { $ne: "CANCELLED" },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$totalPrice" },
        },
      },
    ]);
    const totalValueSaved = valueAggregate[0]?.totalValue || 0;

    const dailyTrends = await Reservation.aggregate([
      {
        $match: {
          recipientId: mongoUser._id,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          meals: { $sum: "$quantity" },
          costSaved: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      timeframe,
      metrics: {
        totalReservations,
        completedReservations,
        cancelledReservations,
        totalQuantityRescued,
        totalValueSaved,
      },
      dailyTrends,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminAnalytics = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);

    if (mongoUser.role !== "ADMIN") {
      res.status(403);
      throw new Error(
        "Forbidden - Only system administrators can access platform analytics",
      );
    }

    const { timeframe = "30d" } = req.query;
    const startDate = getStartDateFromTimeframe(timeframe);

    const totalBusinesses = await BusinessProfile.countDocuments({});
    const totalRecipients = await RecipientProfile.countDocuments({});
    const verifiedBusinesses = await BusinessProfile.countDocuments({
      isVerified: true,
    });
    const verifiedRecipients = await RecipientProfile.countDocuments({
      isVerified: true,
    });

    const totalFoodListed = await Food.countDocuments({
      createdAt: { $gte: startDate },
    });
    const activeListings = await Food.countDocuments({
      status: { $in: ["AVAILABLE", "EXPIRING_SOON", "ALMOST_EXPIRED"] },
      quantity: { $gt: 0 },
    });

    const totalReservations = await Reservation.countDocuments({
      createdAt: { $gte: startDate },
    });
    const completedReservations = await Reservation.countDocuments({
      createdAt: { $gte: startDate },
      status: "COMPLETED",
    });
    const cancelledReservations = await Reservation.countDocuments({
      createdAt: { $gte: startDate },
      status: "CANCELLED",
    });

    const rescuedAggregate = await Reservation.aggregate([
      {
        $match: {
          status: "COMPLETED",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalMeals: { $sum: "$quantity" },
        },
      },
    ]);
    const totalQuantityRescued = rescuedAggregate[0]?.totalMeals || 0;

    const valueAggregate = await Reservation.aggregate([
      {
        $match: {
          status: { $ne: "CANCELLED" },
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$totalPrice" },
        },
      },
    ]);
    const totalValueRecovered = valueAggregate[0]?.totalValue || 0;

    const dailyTrends = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          meals: { $sum: "$quantity" },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      timeframe,
      metrics: {
        totalBusinesses,
        totalRecipients,
        verifiedBusinesses,
        verifiedRecipients,
        totalFoodListed,
        activeListings,
        totalReservations,
        completedReservations,
        cancelledReservations,
        totalQuantityRescued,
        totalValueRecovered,
      },
      dailyTrends,
    });
  } catch (error) {
    next(error);
  }
};




const getGlobalImpact = async (req, res, next) => {
  try {
    const totalReservations = await Reservation.countDocuments({ status: "COMPLETED" });
    const allCompleted = await Reservation.find({ status: "COMPLETED" }).populate("foodId", "quantity");
    
    let totalPlates = 0;
    allCompleted.forEach(res => {
      const q = res.quantity || (res.foodId && res.foodId.quantity) || 1;
      totalPlates += q;
    });

    const co2Saved = ((totalPlates * 2.5) / 1000).toFixed(1);
    const donorsCount = await User.countDocuments({ role: "BUSINESS" });
    const ngosCount = await User.countDocuments({ role: "RECIPIENT" });

    const topDonors = await Food.aggregate([
      { $group: { _id: "$businessId", totalPlates: { $sum: "$quantity" } } },
      { $sort: { totalPlates: -1 } },
      { $limit: 5 }
    ]);
    
    const populatedDonors = await User.populate(topDonors, { path: "_id", select: "name location" });
    
    const leaderboard = populatedDonors.map(donor => ({
      name: donor._id ? donor._id.name : "Anonymous Partner",
      location: donor._id && donor._id.location ? donor._id.location.city : "NCR Region",
      meals: `${donor.totalPlates} plates`
    }));

    res.status(200).json({
      success: true,
      impact: {
        totalPlatesSaved: totalPlates,
        co2EmissionsSaved: co2Saved + " Tons",
        commercialDonors: donorsCount,
        ngoBeneficiaries: ngosCount,
        leaderboard
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports.getGlobalImpact = getGlobalImpact;


module.exports = {
  getBusinessAnalytics,
  getRecipientAnalytics,
  getAdminAnalytics,
  getGlobalImpact
};

