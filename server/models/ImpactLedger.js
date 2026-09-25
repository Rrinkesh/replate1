const mongoose = require("mongoose");

const impactLedgerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    reservationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      index: true,
    },
    type: {
      type: String,
      enum: ["EARNED", "SPENT", "PENALTY"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate rewards per reservation per user
impactLedgerSchema.index(
  { userId: 1, reservationId: 1, type: 1 },
  { unique: true, partialFilterExpression: { reservationId: { $exists: true } } }
);

module.exports = mongoose.model("ImpactLedger", impactLedgerSchema);
