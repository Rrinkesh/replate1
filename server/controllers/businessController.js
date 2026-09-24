const BusinessProfile = require("../models/BusinessProfile");
const User = require("../models/User");

const getAuthenticatedBusinessUser = async (req, res) => {
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
      email: req.user.email || "business@replate.org",
      name: req.user.name || "Business Partner",
      role: "BUSINESS",
    });
  }

  if (mongoUser.role !== "BUSINESS" && mongoUser.role !== "ADMIN") {
    const err = new Error(
      "Forbidden - Only business accounts can access business profiles",
    );
    err.statusCode = 403;
    throw err;
  }

  return mongoUser;
};

const getMyBusinessProfile = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedBusinessUser(req, res);

    let profile = await BusinessProfile.findOne({ userId: mongoUser._id });

    if (!profile) {
      // Auto-create default profile if first time
      profile = await BusinessProfile.create({
        userId: mongoUser._id,
        businessName:
          mongoUser.organizationName || mongoUser.name || "Commercial Kitchen",
        businessType: "RESTAURANT",
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

const createBusinessProfile = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedBusinessUser(req, res);

    const existingProfile = await BusinessProfile.findOne({
      userId: mongoUser._id,
    });
    if (existingProfile) {
      res.status(400);
      throw new Error(
        "Business profile already exists. Use PUT /api/businesses/profile to update.",
      );
    }

    const {
      businessName,
      businessType,
      description,
      phone,
      address,
      city,
      state,
      pincode,
      profileImage,
    } = req.body;

    if (!businessName || !businessName.trim()) {
      res.status(400);
      throw new Error("Business name is required");
    }

    const profile = await BusinessProfile.create({
      userId: mongoUser._id,
      businessName,
      businessType: businessType ? businessType.toUpperCase() : "RESTAURANT",
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
      message: "Business profile created successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

const { deleteImageFile } = require("../services/uploadService");

const updateBusinessProfile = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedBusinessUser(req, res);

    let profile = await BusinessProfile.findOne({ userId: mongoUser._id });

    const {
      businessName,
      businessType,
      description,
      phone,
      address,
      city,
      state,
      pincode,
      profileImage,
    } = req.body;

    if (!profile) {
      profile = await BusinessProfile.create({
        userId: mongoUser._id,
        businessName:
          businessName || mongoUser.organizationName || mongoUser.name,
        businessType: businessType ? businessType.toUpperCase() : "RESTAURANT",
        description,
        phone,
        address,
        city: city || "Noida",
        state: state || "Uttar Pradesh",
        pincode,
        profileImage,
      });
    } else {
      profile.businessName = businessName || profile.businessName;
      if (businessType) profile.businessType = businessType.toUpperCase();
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
    if (businessName) {
      mongoUser.organizationName = businessName;
      await mongoUser.save().catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: "Business profile updated successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyBusinessProfile,
  createBusinessProfile,
  updateBusinessProfile,
};
