const mongoose = require("mongoose");

const businessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    businessName: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
    },
    businessType: {
      type: String,
      required: [true, "Business type is required"],
      enum: {
        values: [
          "HOTEL",
          "RESTAURANT",
          "CAFE",
          "BAKERY",
          "CLOUD_KITCHEN",
          "PARTY",
          "OTHER",
        ],
        message: "{VALUE} is not a valid business type",
      },
      default: "RESTAURANT",
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      default: "Noida",
    },
    state: {
      type: String,
      default: "Uttar Pradesh",
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },
    latitude: {
      type: Number,
      default: 28.5355,
    },
    longitude: {
      type: Number,
      default: 77.391,
    },
    profileImage: {
      type: String,
      default: "",
    },
    registrationNumber: { type: String, default: "" },
    eventCardImage: { type: String, default: "" },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("BusinessProfile", businessProfileSchema);
