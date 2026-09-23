const RecipientProfile = require("../models/RecipientProfile");
const User = require("../models/User");

/**
 * Helper: Find authenticated MongoDB user and verify RECIPIENT role
 */
const getAuthenticatedRecipientUser = async (req, res) => {
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
      email: req.user.email || "recipient@replate.org",
      name: req.user.name || "Recipient Partner",
      role: "RECIPIENT",
    });
  }

  if (mongoUser.role !== "RECIPIENT" && mongoUser.role !== "ADMIN") {
    const err = new Error(
      "Forbidden - Only recipient accounts can access recipient profiles",
    );
    err.statusCode = 403;
    throw err;
  }

  return mongoUser;
};

/**
 * @desc    Get authenticated recipient profile
 * @route   GET /api/recipients/me
 * @access  Private (Recipient only)
 */
const getMyRecipientProfile = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedRecipientUser(req, res);

    let profile = await RecipientProfile.findOne({ userId: mongoUser._id });

    if (!profile) {
      profile = await RecipientProfile.create({
        userId: mongoUser._id,
        organizationName:
          mongoUser.organizationName ||
          mongoUser.name ||
          "Recipient NGO Shelter",
        recipientType: "NGO",
        phone: mongoUser.phone || "",
        address: mongoUser.location?.address || "",
        city: mongoUser.location?.city || "Noida",
        state: mongoUser.location?.state || "Uttar Pradesh",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create recipient profile
 * @route   POST /api/recipients/profile
 * @access  Private (Recipient only)
 */
const createRecipientProfile = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedRecipientUser(req, res);

    const existingProfile = await RecipientProfile.findOne({
      userId: mongoUser._id,
    });
    if (existingProfile) {
      res.status(400);
      throw new Error(
        "Recipient profile already exists. Use PUT /api/recipients/profile to update.",
      );
    }

    const {
      organizationName,
      recipientType,
      description,
      phone,
      address,
      city,
      state,
      pincode,
      profileImage,
    } = req.body;

    if (!organizationName || !organizationName.trim()) {
      res.status(400);
      throw new Error("Organization name is required");
    }

    const profile = await RecipientProfile.create({
      userId: mongoUser._id,
      organizationName,
      recipientType: recipientType ? recipientType.toUpperCase() : "NGO",
      description,
      phone,
      address,
      city: city || "Noida",
      state: state || "Uttar Pradesh",
      pincode,
      profileImage,
    });

    res.status(201).json({
      success: true,
      message: "Recipient profile created successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

const { deleteImageFile } = require("../services/uploadService");

/**
 * @desc    Update recipient profile
 * @route   PUT /api/recipients/profile
 * @access  Private (Recipient only)
 */
const updateRecipientProfile = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedRecipientUser(req, res);

    let profile = await RecipientProfile.findOne({ userId: mongoUser._id });

    const {
      organizationName,
      recipientType,
      description,
      phone,
      address,
      city,
      state,
      pincode,
      profileImage,
    } = req.body;

    if (!profile) {
      profile = await RecipientProfile.create({
        userId: mongoUser._id,
        organizationName:
          organizationName || mongoUser.organizationName || mongoUser.name,
        recipientType: recipientType ? recipientType.toUpperCase() : "NGO",
        description,
        phone,
        address,
        city: city || "Noida",
        state: state || "Uttar Pradesh",
        pincode,
        profileImage,
      });
    } else {
      profile.organizationName = organizationName || profile.organizationName;
      if (recipientType) profile.recipientType = recipientType.toUpperCase();
      if (description !== undefined) profile.description = description;
      if (phone !== undefined) profile.phone = phone;
      if (address !== undefined) profile.address = address;
      if (city !== undefined) profile.city = city;
      if (state !== undefined) profile.state = state;
      if (pincode !== undefined) profile.pincode = pincode;

      // Cleanup old profile image if replaced
      if (
        profileImage &&
        profile.profileImage &&
        profileImage !== profile.profileImage
      ) {
        deleteImageFile(profile.profileImage);
      }
      if (profileImage !== undefined) profile.profileImage = profileImage;

      await profile.save();
    }

    // Also update mongoUser organizationName
    if (organizationName) {
      mongoUser.organizationName = organizationName;
      await mongoUser.save().catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: "Recipient profile updated successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyRecipientProfile,
  createRecipientProfile,
  updateRecipientProfile,
};
