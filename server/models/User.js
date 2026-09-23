const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: [true, "Firebase UID is required"],
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    role: {
      type: String,
      enum: {
        values: ["BUSINESS", "RECIPIENT", "ADMIN"],
        message:
          "{VALUE} is not a valid role. Allowed roles: BUSINESS, RECIPIENT, ADMIN",
      },
      default: "BUSINESS",
      uppercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    organizationName: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "Noida" },
      state: { type: String, default: "Uttar Pradesh" },
      pincode: { type: String, default: "" },
      coordinates: {
        lat: { type: Number, default: 28.5355 },
        lng: { type: Number, default: 77.391 },
      },
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

// Mongoose Model compile
const User = mongoose.model("User", userSchema);

module.exports = User;
