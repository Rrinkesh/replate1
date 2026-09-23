const mongoose = require("mongoose");

const recipientProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    organizationName: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    recipientType: {
      type: String,
      required: [true, "Recipient type is required"],
      enum: {
        values: ["INDIVIDUAL", "NGO", "COMMUNITY", "ORGANIZATION", "BUYER"],
        message: "{VALUE} is not a valid recipient type",
      },
      default: "NGO",
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
    profileImage: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("RecipientProfile", recipientProfileSchema);
