const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: [true, "Food listing reference is required"],
      index: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient user reference is required"],
      index: true,
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Business user reference is required"],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, "Reserved quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    claimCode: {
      type: String,
      required: [true, "Claim code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: [
          "PENDING",
          "CONFIRMED",
          "READY_FOR_PICKUP",
          "COMPLETED",
          "CANCELLED",
          "EXPIRED",
        ],
        message: "{VALUE} is not a valid reservation status",
      },
      default: "PENDING",
      uppercase: true,
    },
    reservedAt: {
      type: Date,
      default: Date.now,
    },
    pickupTime: {
      type: String,
      default: "Today before 8:30 PM",
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Reservation", reservationSchema);
