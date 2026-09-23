const BusinessProfile = require("../models/BusinessProfile");
const RecipientProfile = require("../models/RecipientProfile");
const User = require("../models/User");
const { createNotificationHelper } = require("../utils/notificationUtils");
const admin = require("../config/firebaseAdmin");

/**
 * @desc    Get all business profiles (Admin moderation)
 * @route   GET /api/admin/businesses
 * @access  Private (Admin only)
 */
const getAllBusinesses = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (status === "verified") {
      filter.isVerified = true;
    } else if (status === "unverified") {
      filter.isVerified = false;
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { businessName: regex },
        { phone: regex },
        { city: regex },
        { state: regex },
      ];
    }

    const businesses = await BusinessProfile.find(filter)
      .populate("userId", "name email role phone organizationName createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: businesses.length,
      businesses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all recipient profiles (Admin moderation)
 * @route   GET /api/admin/recipients
 * @access  Private (Admin only)
 */
const getAllRecipients = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const filter = {};

    if (status === "verified") {
      filter.isVerified = true;
    } else if (status === "unverified") {
      filter.isVerified = false;
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { organizationName: regex },
        { phone: regex },
        { city: regex },
        { state: regex },
      ];
    }

    const recipients = await RecipientProfile.find(filter)
      .populate(
        "userId",
        "name email role phone organizationName recipientType createdAt",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recipients.length,
      recipients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify or unverify a business profile
 * @route   PUT /api/admin/businesses/:id/verify
 * @access  Private (Admin only)
 */
const verifyBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    let profile = await BusinessProfile.findById(id);

    // Fallback: search by userId if not found by profile ID directly
    if (!profile && id.match(/^[0-9a-fA-F]{24}$/)) {
      profile = await BusinessProfile.findOne({ userId: id });
    }

    if (!profile) {
      res.status(404);
      throw new Error(`Business profile '${id}' not found`);
    }

    profile.isVerified =
      isVerified !== undefined ? Boolean(isVerified) : !profile.isVerified;
    await profile.save();

    // Sync isVerified to User model
    if (profile.userId) {
      await User.findByIdAndUpdate(profile.userId, {
        isVerified: profile.isVerified,
      });
    }

    const updatedProfile = await BusinessProfile.findById(profile._id).populate(
      "userId",
      "name email role phone organizationName",
    );

    // Notify business user of verification update
    await createNotificationHelper({
      userId: profile.userId,
      type: "VERIFICATION_UPDATED",
      title: "Account Verification Updated",
      message: `Your commercial donor account "${profile.businessName}" verification status is now ${
        profile.isVerified ? "VERIFIED" : "UNVERIFIED"
      }.`,
      relatedId: profile._id,
    });

    res.status(200).json({
      success: true,
      message: `Business partner '${profile.businessName}' ${
        profile.isVerified ? "verified" : "unverified"
      } successfully`,
      business: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify or unverify a recipient profile
 * @route   PUT /api/admin/recipients/:id/verify
 * @access  Private (Admin only)
 */
const verifyRecipient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    let profile = await RecipientProfile.findById(id);

    // Fallback: search by userId if not found by profile ID directly
    if (!profile && id.match(/^[0-9a-fA-F]{24}$/)) {
      profile = await RecipientProfile.findOne({ userId: id });
    }

    if (!profile) {
      res.status(404);
      throw new Error(`Recipient profile '${id}' not found`);
    }

    profile.isVerified =
      isVerified !== undefined ? Boolean(isVerified) : !profile.isVerified;
    await profile.save();

    // Sync isVerified to User model
    if (profile.userId) {
      await User.findByIdAndUpdate(profile.userId, {
        isVerified: profile.isVerified,
      });
    }

    const updatedProfile = await RecipientProfile.findById(
      profile._id,
    ).populate(
      "userId",
      "name email role phone organizationName recipientType",
    );

    // Notify recipient user of verification update
    await createNotificationHelper({
      userId: profile.userId,
      type: "VERIFICATION_UPDATED",
      title: "Account Verification Updated",
      message: `Your NGO recipient account "${profile.organizationName}" verification status is now ${
        profile.isVerified ? "VERIFIED" : "UNVERIFIED"
      }.`,
      relatedId: profile._id,
    });

    res.status(200).json({
      success: true,
      message: `Recipient partner '${profile.organizationName}' ${
        profile.isVerified ? "verified" : "unverified"
      } successfully`,
      recipient: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

const rejectBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    let profile = await BusinessProfile.findById(id);
    if (!profile) profile = await BusinessProfile.findOne({ userId: id });

    if (!profile) {
      res.status(404);
      throw new Error(`Business profile not found`);
    }

    let firebaseUidToDelete = null;
    if (profile.userId) {
      const userDoc = await User.findById(profile.userId);
      if (userDoc && userDoc.firebaseUid) {
        firebaseUidToDelete = userDoc.firebaseUid;
      }
      await User.findByIdAndDelete(profile.userId);
    }
    await BusinessProfile.findByIdAndDelete(profile._id);

    if (firebaseUidToDelete) {
      try {
        await admin.auth().deleteUser(firebaseUidToDelete);
      } catch (fbErr) {
        console.warn(
          "Could not delete user from Firebase (may already be deleted or invalid config):",
          fbErr.message,
        );
      }
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Business application rejected and removed",
      });
  } catch (error) {
    next(error);
  }
};

const rejectRecipient = async (req, res, next) => {
  try {
    const { id } = req.params;
    let profile = await RecipientProfile.findById(id);
    if (!profile) profile = await RecipientProfile.findOne({ userId: id });

    if (!profile) {
      res.status(404);
      throw new Error(`Recipient profile not found`);
    }

    let firebaseUidToDelete = null;
    if (profile.userId) {
      const userDoc = await User.findById(profile.userId);
      if (userDoc && userDoc.firebaseUid) {
        firebaseUidToDelete = userDoc.firebaseUid;
      }
      await User.findByIdAndDelete(profile.userId);
    }
    await RecipientProfile.findByIdAndDelete(profile._id);

    if (firebaseUidToDelete) {
      try {
        await admin.auth().deleteUser(firebaseUidToDelete);
      } catch (fbErr) {
        console.warn(
          "Could not delete user from Firebase (may already be deleted or invalid config):",
          fbErr.message,
        );
      }
    }

    res
      .status(200)
      .json({ success: true, message: "NGO application rejected and removed" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBusinesses,
  getAllRecipients,
  verifyBusiness,
  verifyRecipient,
  rejectBusiness,
  rejectRecipient,
};
