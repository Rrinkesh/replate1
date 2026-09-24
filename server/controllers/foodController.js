const Food = require("../models/Food");
const User = require("../models/User");
const { calculateFoodStatus } = require("../services/foodStatusService");

const getAuthenticatedMongoUser = async (req) => {
  const firebaseUid = req.user?.uid || req.user?.firebaseUid;
  if (!firebaseUid) {
    const err = new Error("Unauthorized - Firebase user token missing");
    err.statusCode = 401;
    throw err;
  }

  let mongoUser = await User.findOne({ firebaseUid });
  if (!mongoUser) {
    // Sync fallback user if missing
    mongoUser = await User.create({
      firebaseUid,
      email: req.user.email || "partner@replate.org",
      name: req.user.name || "Business Partner",
      role: "BUSINESS",
    });
  }

  return mongoUser;
};

const createFood = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedMongoUser(req);

    // Verify role permissions
    if (mongoUser.role !== "BUSINESS" && mongoUser.role !== "ADMIN") {
      res.status(403);
      throw new Error(
        "Forbidden - Only business accounts can post surplus food listings",
      );
    }

    const {
      name,
      description,
      category,
      quantity,
      quantityUnit,
      preparationTime,
      expiryTime,
      expiryHours,
      price,
      originalPrice,
      pickupLocation,
      image,
    } = req.body;

    if (!name || !quantity || price === undefined) {
      res.status(400);
      throw new Error("Name, quantity, and price are required fields");
    }

    // Calculate expiryTime if relative hours supplied
    let calculatedExpiry = expiryTime ? new Date(expiryTime) : null;
    if (!calculatedExpiry || isNaN(calculatedExpiry.getTime())) {
      const hours = expiryHours ? Number(expiryHours) : 3;
      calculatedExpiry = new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    const tempFood = {
      quantity: Number(quantity),
      expiryTime: calculatedExpiry,
    };
    const computedStatus = calculateFoodStatus(tempFood);

    const food = await Food.create({
      businessId: mongoUser._id, // Enforced backend ownership
      name,
      description,
      category: category || "Prepared Meals",
      quantity: Number(quantity),
      quantityUnit: quantityUnit || "servings",
      preparationTime: preparationTime ? new Date(preparationTime) : new Date(),
      expiryTime: calculatedExpiry,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      pickupLocation: pickupLocation ||
        mongoUser.location || { address: "", city: "Noida" },
      image: image || undefined,
      status: computedStatus,
    });

    res.status(201).json({
      success: true,
      message: "Food listing created successfully",
      food,
    });
  } catch (error) {
    next(error);
  }
};

const getFoodListings = async (req, res, next) => {
  try {
    const { search, category, status, minPrice, maxPrice, businessId } =
      req.query;

    const filter = {};

    // Filter by businessId if provided
    if (businessId) {
      filter.businessId = businessId;
    }

    // Search query
    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category && category !== "All") {
      filter.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const listings = await Food.find(filter)
      .populate("businessId", "name organizationName phone location isVerified")
      .sort({ createdAt: -1 });

    // Compute live expiry status for all returned listings
    const updatedListings = await Promise.all(
      listings.map(async (item) => {
        const liveStatus = calculateFoodStatus(item);
        if (liveStatus !== item.status) {
          item.status = liveStatus;
          await item.save().catch(() => {});
        }
        return item;
      }),
    );

    // Apply status query filter if specified, or exclude EXPIRED listings by default for public marketplace requests
    let filteredListings = updatedListings;
    if (status && status !== "All") {
      filteredListings = updatedListings.filter(
        (item) => item.status === status,
      );
    } else if (!businessId) {
      // Exclude expired and sold out listings by default in public marketplace
      filteredListings = updatedListings.filter(
        (item) => item.status !== "EXPIRED" && item.status !== "SOLD_OUT",
      );
    }

    res.status(200).json({
      success: true,
      count: filteredListings.length,
      food: filteredListings,
      foods: filteredListings,
    });
  } catch (error) {
    next(error);
  }
};

const getFoodById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error("Invalid Food Listing ID format");
    }

    const food = await Food.findById(id).populate(
      "businessId",
      "name organizationName email phone location isVerified",
    );

    if (!food) {
      res.status(404);
      throw new Error(`Food listing '${id}' not found`);
    }

    // Update status dynamically
    const liveStatus = calculateFoodStatus(food);
    if (liveStatus !== food.status) {
      food.status = liveStatus;
      await food.save().catch(() => {});
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    next(error);
  }
};

const { deleteImageFile } = require("../services/uploadService");

const updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mongoUser = await getAuthenticatedMongoUser(req);

    let food = await Food.findById(id);

    if (!food) {
      res.status(404);
      throw new Error(`Food listing '${id}' not found`);
    }

    // Enforce Backend Ownership Check
    if (
      food.businessId.toString() !== mongoUser._id.toString() &&
      mongoUser.role !== "ADMIN"
    ) {
      res.status(403);
      throw new Error("Forbidden - You can only modify your own food listings");
    }

    // Update allowed fields
    const {
      name,
      description,
      category,
      quantity,
      quantityUnit,
      expiryTime,
      price,
      originalPrice,
      status,
      image,
    } = req.body;

    food.name = name || food.name;
    food.description =
      description !== undefined ? description : food.description;
    food.category = category || food.category;
    food.quantity = quantity !== undefined ? Number(quantity) : food.quantity;
    food.quantityUnit = quantityUnit || food.quantityUnit;
    if (expiryTime) food.expiryTime = new Date(expiryTime);
    food.price = price !== undefined ? Number(price) : food.price;
    food.originalPrice =
      originalPrice !== undefined ? Number(originalPrice) : food.originalPrice;

    // Cleanup old image if replaced
    if (image && food.image && image !== food.image) {
      deleteImageFile(food.image);
    }
    if (image) food.image = image;

    if (status) food.status = status;

    food.status = calculateFoodStatus(food);

    await food.save();

    res.status(200).json({
      success: true,
      message: "Food listing updated successfully",
      food,
    });
  } catch (error) {
    next(error);
  }
};

const deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mongoUser = await getAuthenticatedMongoUser(req);

    const food = await Food.findById(id);

    if (!food) {
      res.status(404);
      throw new Error(`Food listing '${id}' not found`);
    }

    // Enforce Backend Ownership Check
    if (
      food.businessId.toString() !== mongoUser._id.toString() &&
      mongoUser.role !== "ADMIN"
    ) {
      res.status(403);
      throw new Error("Forbidden - You can only delete your own food listings");
    }

    // Clean up uploaded image
    if (food.image) {
      deleteImageFile(food.image);
    }

    await food.deleteOne();

    res.status(200).json({
      success: true,
      message: "Food listing deleted successfully",
      id,
    });
  } catch (error) {
    next(error);
  }
};

const getMyFoodListings = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedMongoUser(req);

    if (mongoUser.role !== "BUSINESS" && mongoUser.role !== "ADMIN") {
      res.status(403);
      throw new Error(
        "Forbidden - Only business accounts can manage their food inventory",
      );
    }

    const { status, category, search } = req.query;

    const filter = { businessId: mongoUser._id };

    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    let listings = await Food.find(filter).sort({ createdAt: -1 });

    const Reservation = require("../models/Reservation");

    const enhancedListings = await Promise.all(
      listings.map(async (doc) => {
        const item = doc.toObject(); // Convert to plain object to safely add custom properties

        // Update live status if changed
        const liveStatus = calculateFoodStatus(doc);
        if (liveStatus !== doc.status) {
          doc.status = liveStatus;
          await doc.save().catch(() => {});
        }
        item.status = liveStatus;

        // Count active reservations
        const activeReservationsCount = await Reservation.countDocuments({
          foodId: item._id,
          status: { $in: ["PENDING", "CONFIRMED", "READY_FOR_PICKUP"] },
        });

        item.reservationCount = activeReservationsCount;
        return item;
      }),
    );

    let filteredListings = enhancedListings;
    if (status && status !== "All") {
      if (status === "Available") {
        filteredListings = enhancedListings.filter((item) =>
          ["AVAILABLE", "EXPIRING_SOON", "ALMOST_EXPIRED"].includes(
            item.status,
          ),
        );
      } else {
        filteredListings = enhancedListings.filter(
          (item) => item.status === status.toUpperCase().replace(" ", "_"),
        );
      }
    }

    res.status(200).json({
      success: true,
      count: filteredListings.length,
      food: filteredListings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFood,
  getFoodListings,
  getMyFoodListings,
  getFoodById,
  updateFood,
  deleteFood,
};
