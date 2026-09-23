const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Business owner reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Food listing name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Food category is required"],
      enum: {
        values: [
          "Prepared Meals",
          "Bakery & Pastries",
          "Catering Surplus",
          "Groceries & Produce",
          "Beverages",
          "Other",
        ],
        message: "{VALUE} is not a valid food category",
      },
      default: "Prepared Meals",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    quantityUnit: {
      type: String,
      enum: ["servings", "boxes", "plates", "kg", "items"],
      default: "servings",
    },
    preparationTime: {
      type: Date,
      default: Date.now,
    },
    expiryTime: {
      type: Date,
      required: [true, "Expiry timestamp is required"],
    },
    price: {
      type: Number,
      required: [true, "Recovery price is required"],
      min: [0, "Price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      min: [0, "Original price cannot be negative"],
    },
    pickupLocation: {
      address: { type: String, default: "" },
      city: { type: String, default: "Noida" },
      state: { type: String, default: "Uttar Pradesh" },
      coordinates: {
        lat: { type: Number, default: 28.5355 },
        lng: { type: Number, default: 77.391 },
      },
    },
    image: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
    },
    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "EXPIRING_SOON",
        "ALMOST_EXPIRED",
        "SOLD_OUT",
        "EXPIRED",
      ],
      default: "AVAILABLE",
      uppercase: true,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual field for calculated discount percentage
foodSchema.virtual("discountPercent").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100,
    );
  }
  return 0;
});

// Ensure virtuals are included in JSON output
foodSchema.set("toJSON", { virtuals: true });
foodSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Food", foodSchema);
