const mongoose = require("mongoose");

const rewardRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["FEATURED_PLACEMENT", "FUNDRAISING_CAMPAIGN"],
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "ACTIVE", "EXPIRED"],
      default: "PENDING",
    },
    creditsSpent: {
      type: Number,
      required: true,
    },
    details: {
      title: String,
      description: String,
      goalAmount: Number, // For fundraising
      raisedAmount: { type: Number, default: 0 },
      durationDays: Number, // For featured placement
    },
    adminNotes: {
      type: String,
      default: "",
    },
    approvedAt: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RewardRequest", rewardRequestSchema);
