const User = require("../models/User");
const BusinessProfile = require("../models/BusinessProfile");
const RecipientProfile = require("../models/RecipientProfile");

const getCurrentUser = async (req, res, next) => {
  try {
    const firebaseUid = req.user?.uid || req.user?.firebaseUid;

    if (!firebaseUid) {
      res.status(401);
      throw new Error("Unauthorized - User identity missing from request");
    }

    let user = await User.findOne({ firebaseUid });

    const email = req.user.email || user?.email || "user@replate.org";
    const isSuperAdmin =
      process.env.SUPER_ADMIN_EMAIL &&
      email.toLowerCase() ===
        process.env.SUPER_ADMIN_EMAIL.trim().toLowerCase();

    if (!user) {
      // Auto-create basic profile if first time accessing /me
      user = await User.create({
        firebaseUid,
        email,
        name: req.user.name || "RePlate User",
        role: isSuperAdmin ? "ADMIN" : "BUSINESS",
        isVerified: isSuperAdmin ? true : false,
      });
    } else if (isSuperAdmin && (user.role !== "ADMIN" || !user.isVerified)) {
      // Auto-promote existing profile
      user.role = "ADMIN";
      user.isVerified = true;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const syncUser = async (req, res, next) => {
  try {
    const firebaseUid =
      req.user?.uid || req.user?.firebaseUid || req.body.firebaseUid;
    const email = req.user?.email || req.body.email;

    if (!firebaseUid) {
      res.status(400);
      throw new Error(
        "Firebase UID is required for user profile synchronization",
      );
    }

    const { name, role, phone, organizationName, location, profileImage } =
      req.body;

    let user = await User.findOne({ firebaseUid });

    // Format role enum safely
    const formattedRole = role
      ? role.toUpperCase()
      : user
        ? user.role
        : "BUSINESS";

    // If user already exists, ALWAYS preserve their role to prevent frontend overwrites during login
    let finalRole = user
      ? user.role
      : ["BUSINESS", "RECIPIENT"].includes(formattedRole)
        ? formattedRole
        : "BUSINESS";

    const isSuperAdmin =
      email &&
      process.env.SUPER_ADMIN_EMAIL &&
      email.toLowerCase() ===
        process.env.SUPER_ADMIN_EMAIL.trim().toLowerCase();
    if (isSuperAdmin) {
      finalRole = "ADMIN";
    }

    if (user) {
      // Update existing user profile
      user.name = name || user.name;
      user.email = email || user.email;
      // We only update the role if they were promoted to ADMIN
      if (isSuperAdmin) {
        user.role = "ADMIN";
        user.isVerified = true;
      }
      user.phone = phone || user.phone;
      user.organizationName = organizationName || user.organizationName;
      if (isSuperAdmin) user.isVerified = true;
      if (profileImage) user.profileImage = profileImage;

      if (location) {
        if (!user.location) user.location = {};
        if (location.address !== undefined)
          user.location.address = location.address;
        if (location.city !== undefined) user.location.city = location.city;
        if (location.state !== undefined) user.location.state = location.state;
        if (location.pincode !== undefined)
          user.location.pincode = location.pincode;
      }

      await user.save();
    } else {
      // Create new MongoDB user profile
      user = await User.create({
        firebaseUid,
        email: email || "user@replate.org",
        name: name || req.user?.name || "RePlate Partner",
        role: finalRole,
        isVerified: isSuperAdmin ? true : false,
        phone: phone || "",
        organizationName: organizationName || "",
        profileImage: profileImage || req.user?.picture || "",
        location: {
          address: location?.address || "",
          city: location?.city || "Noida",
          state: location?.state || "Uttar Pradesh",
          pincode: location?.pincode || "",
        },
      });
    }

    // Auto-create associated profile so they appear in Admin Verification Queue immediately
    if (user.role === "BUSINESS") {
      const existing = await BusinessProfile.findOne({ userId: user._id });
      if (!existing) {
        await BusinessProfile.create({
          userId: user._id,
          businessName:
            user.organizationName || user.name || "Commercial Kitchen",
          businessType: "RESTAURANT",
          phone: user.phone || "",
          address: user.location?.address || "",
          city: user.location?.city || "Noida",
          state: user.location?.state || "Uttar Pradesh",
          isVerified: user.isVerified,
        });
      }
    } else if (user.role === "RECIPIENT") {
      const existing = await RecipientProfile.findOne({ userId: user._id });
      if (!existing) {
        await RecipientProfile.create({
          userId: user._id,
          organizationName: user.organizationName || user.name || "NGO Shelter",
          recipientType: "NGO",
          phone: user.phone || "",
          address: user.location?.address || "",
          city: user.location?.city || "Noida",
          state: user.location?.state || "Uttar Pradesh",
          isVerified: user.isVerified,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "MongoDB user profile synced successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-__v");
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserByUid = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      res.status(404);
      throw new Error(`User profile with Firebase UID '${uid}' not found`);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentUser,
  syncUser,
  getUsers,
  getUserByUid,
};
