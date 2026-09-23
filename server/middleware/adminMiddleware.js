const User = require("../models/User");

/**
 * Middleware: Requires authenticated user to have ADMIN role in database
 */
const adminOnly = async (req, res, next) => {
  try {
    const firebaseUid = req.user?.uid || req.user?.firebaseUid;
    if (!firebaseUid) {
      res.status(401);
      throw new Error("Unauthorized - Firebase authentication token missing");
    }

    const mongoUser = await User.findOne({ firebaseUid });
    if (!mongoUser) {
      res.status(401);
      throw new Error("Unauthorized - User profile record not found in system");
    }

    if (mongoUser.role !== "ADMIN") {
      res.status(403);
      throw new Error(
        "Forbidden - Only platform system administrators can access this resource",
      );
    }

    req.mongoUser = mongoUser;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminOnly,
};
