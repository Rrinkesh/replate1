const Reservation = require("../models/Reservation");
const Food = require("../models/Food");
const User = require("../models/User");
const { calculateFoodStatus } = require("../services/foodStatusService");
const { createNotificationHelper } = require("../utils/notificationUtils");

/**
 * Helper: Get authenticated user from req.user
 */
const getAuthenticatedUser = async (req) => {
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
      email: req.user.email || "user@replate.org",
      name: req.user.name || "RePlate User",
      role: "RECIPIENT",
    });
  }
  return mongoUser;
};

/**
 * @desc    Create a new food reservation/claim (Concurrency & Quantity Hardened)
 * @route   POST /api/reservations
 * @access  Private (Recipient only)
 */
const createReservation = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);

    if (mongoUser.role !== "RECIPIENT" && mongoUser.role !== "ADMIN") {
      res.status(403);
      throw new Error(
        "Forbidden - Only verified Recipient accounts can reserve surplus food",
      );
    }

    const { foodId, quantity } = req.body;

    // Never trust quantity or prices from frontend payload
    const requestedQty = Math.max(1, parseInt(quantity, 10) || 1);

    if (!foodId) {
      res.status(400);
      throw new Error("Food ID is required to create a reservation");
    }

    // 1. Fetch initial food listing to inspect status & expiry
    const food = await Food.findById(foodId);
    if (!food) {
      res.status(404);
      throw new Error("Food listing not found");
    }

    // Centralized status check
    const currentComputedStatus = calculateFoodStatus(food);

    if (currentComputedStatus === "EXPIRED") {
      if (food.status !== "EXPIRED") {
        food.status = "EXPIRED";
        await food.save().catch(() => {});
      }
      res.status(400);
      throw new Error(
        "This surplus food listing has expired and cannot be reserved",
      );
    }

    if (currentComputedStatus === "SOLD_OUT" || food.quantity < 1) {
      res.status(400);
      throw new Error("This food listing is sold out and no longer available");
    }

    if (requestedQty > food.quantity) {
      res.status(400);
      throw new Error(
        `Requested quantity exceeds available stock (${food.quantity} ${food.quantityUnit || "units"} available)`,
      );
    }

    // 2. Concurrency-Safe Atomic Stock Deduction
    const now = new Date();
    const updatedFood = await Food.findOneAndUpdate(
      {
        _id: foodId,
        status: { $in: ["AVAILABLE", "EXPIRING_SOON", "ALMOST_EXPIRED"] },
        quantity: { $gte: requestedQty },
        $or: [
          { expiryTime: { $gt: now } },
          { expiryTime: null },
          { expiryTime: { $exists: false } },
        ],
      },
      {
        $inc: { quantity: -requestedQty },
      },
      { new: true },
    );

    if (!updatedFood) {
      res.status(400);
      throw new Error(
        "Unable to reserve item. Stock became unavailable or has expired.",
      );
    }

    // Automatically mark food as SOLD_OUT when remaining quantity reaches 0
    if (updatedFood.quantity <= 0) {
      updatedFood.quantity = 0;
      updatedFood.status = "SOLD_OUT";
      await updatedFood.save();
    }

    // 3. Recalculate price on the server strictly using food.price
    const unitPrice = updatedFood.price || 0;
    const totalPrice = unitPrice * requestedQty;
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const claimCode = `RPL-${randomSuffix}`;

    const formattedDeadline = updatedFood.expiryTime
      ? `Today before ${new Date(updatedFood.expiryTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      : "Today before 8:30 PM";

    // Create reservation linking derived authenticated IDs
    const reservation = await Reservation.create({
      foodId: updatedFood._id,
      recipientId: mongoUser._id, // Derived strictly from token
      businessId: updatedFood.businessId, // Derived strictly from food record
      quantity: requestedQty,
      totalPrice, // Server-calculated price
      claimCode,
      status: "PENDING",
      reservedAt: new Date(),
      pickupTime: formattedDeadline,
    });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate("foodId")
      .populate("businessId", "name email phone organizationName");

    // Automatically notify Business owner of new reservation claim
    await createNotificationHelper({
      userId: updatedFood.businessId,
      type: "RESERVATION_CREATED",
      title: "New Surplus Claim Reserved",
      message: `${mongoUser.name || "Recipient NGO"} reserved ${requestedQty} servings of "${updatedFood.name}". Claim code: ${claimCode}`,
      relatedId: reservation._id,
    });

    res.status(201).json({
      success: true,
      message: "Food reservation claimed successfully",
      reservation: populatedReservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reservations for authenticated Recipient
 * @route   GET /api/reservations/my
 * @access  Private (Recipient only)
 */
const getMyReservations = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);
    const { status } = req.query;

    const query = { recipientId: mongoUser._id };

    if (status && status !== "All") {
      if (status === "Active") {
        query.status = { $in: ["PENDING", "CONFIRMED", "READY_FOR_PICKUP"] };
      } else {
        query.status = status.toUpperCase().replace(" ", "_");
      }
    }

    const reservations = await Reservation.find(query)
      .populate("foodId")
      .populate(
        "businessId",
        "name email phone organizationName businessType location",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all reservations for authenticated Business owner
 * @route   GET /api/reservations/business
 * @access  Private (Business only)
 */
const getBusinessReservations = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);

    if (mongoUser.role !== "BUSINESS" && mongoUser.role !== "ADMIN") {
      res.status(403);
      throw new Error(
        "Forbidden - Only commercial business accounts can view incoming reservations",
      );
    }

    const reservations = await Reservation.find({ businessId: mongoUser._id })
      .populate("foodId")
      .populate(
        "recipientId",
        "name email phone organizationName recipientType",
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single reservation details
 * @route   GET /api/reservations/:id
 * @access  Private
 */
const getReservationById = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);

    const reservation = await Reservation.findById(req.params.id)
      .populate("foodId")
      .populate(
        "recipientId",
        "name email phone organizationName recipientType",
      )
      .populate("businessId", "name email phone organizationName businessType");

    if (!reservation) {
      res.status(404);
      throw new Error("Reservation not found");
    }

    const isRecipientOwner = reservation.recipientId._id.equals(mongoUser._id);
    const isBusinessOwner = reservation.businessId._id.equals(mongoUser._id);

    if (!isRecipientOwner && !isBusinessOwner && mongoUser.role !== "ADMIN") {
      res.status(403);
      throw new Error(
        "Forbidden - You do not have permission to view this reservation",
      );
    }

    res.status(200).json({
      success: true,
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Valid state transitions table for Reservation Workflow
 */
const ALLOWED_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
};

/**
 * @desc    Update reservation status (Business operations)
 * @route   PUT /api/reservations/:id/status
 * @access  Private (Business owner only)
 */
const updateReservationStatus = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);
    const { status } = req.body;

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "READY_FOR_PICKUP",
      "COMPLETED",
      "CANCELLED",
      "EXPIRED",
    ];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      res.status(400);
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }

    const newStatus = status.toUpperCase();
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      res.status(404);
      throw new Error("Reservation not found");
    }

    // Verify ownership: authenticated user must be the business owner of this reservation
    if (
      !reservation.businessId.equals(mongoUser._id) &&
      mongoUser.role !== "ADMIN"
    ) {
      res.status(403);
      throw new Error(
        "Forbidden - You can only update status for reservations belonging to your business",
      );
    }

    const prevStatus = reservation.status.toUpperCase();

    // If status is identical, return early
    if (prevStatus === newStatus) {
      return res.status(200).json({
        success: true,
        message: `Reservation is already in ${newStatus} status`,
        reservation,
      });
    }

    // Enforce strict workflow transitions
    const allowedNext = ALLOWED_TRANSITIONS[prevStatus] || [];
    if (!allowedNext.includes(newStatus)) {
      res.status(400);
      throw new Error(
        `Forbidden transition. Cannot change status from ${prevStatus} to ${newStatus}`,
      );
    }

    reservation.status = newStatus;

    if (newStatus === "COMPLETED") {
      reservation.completedAt = new Date();
    }

    if (newStatus === "CANCELLED") {
      reservation.cancelledAt = new Date();
      // Restore inventory stock atomically
      const restoredFood = await Food.findOneAndUpdate(
        { _id: reservation.foodId },
        { $inc: { quantity: reservation.quantity } },
        { new: true },
      );

      if (restoredFood && restoredFood.quantity > 0) {
        if (restoredFood.status === "SOLD_OUT") {
          const isExpired =
            restoredFood.expiryTime &&
            new Date(restoredFood.expiryTime) <= new Date();
          restoredFood.status = isExpired ? "EXPIRED" : "AVAILABLE";
          await restoredFood.save();
        }
      }
    }

    await reservation.save();

    const updatedReservation = await Reservation.findById(reservation._id)
      .populate("foodId")
      .populate(
        "recipientId",
        "name email phone organizationName recipientType",
      )
      .populate("businessId", "name email phone organizationName businessType");

    // Trigger automatic notification based on new status
    const foodTitle = updatedReservation.foodId?.name || "surplus food";
    if (newStatus === "CONFIRMED") {
      await createNotificationHelper({
        userId: reservation.recipientId,
        type: "RESERVATION_CONFIRMED",
        title: "Reservation Confirmed",
        message: `Your claim for "${foodTitle}" (Claim code: ${updatedReservation.claimCode}) was confirmed by the donor.`,
        relatedId: reservation._id,
      });
    } else if (newStatus === "READY_FOR_PICKUP") {
      await createNotificationHelper({
        userId: reservation.recipientId,
        type: "RESERVATION_READY",
        title: "Ready for Pickup",
        message: `Your order for "${foodTitle}" (Claim code: ${updatedReservation.claimCode}) is packed and ready for pickup!`,
        relatedId: reservation._id,
      });
    } else if (newStatus === "COMPLETED") {
      await createNotificationHelper({
        userId: reservation.recipientId,
        type: "RESERVATION_COMPLETED",
        title: "Pickup Complete",
        message: `Your claim for "${foodTitle}" (Claim code: ${updatedReservation.claimCode}) is complete. Thank you for rescuing food!`,
        relatedId: reservation._id,
      });
    } else if (newStatus === "CANCELLED") {
      await createNotificationHelper({
        userId: reservation.recipientId,
        type: "RESERVATION_CANCELLED",
        title: "Reservation Cancelled",
        message: `Reservation for "${foodTitle}" (Claim code: ${reservation.claimCode}) was cancelled by the business.`,
        relatedId: reservation._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Reservation status updated to ${newStatus}`,
      reservation: updatedReservation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel reservation (Recipient user)
 * @route   PUT /api/reservations/:id/cancel
 * @access  Private (Recipient only)
 */
const cancelReservation = async (req, res, next) => {
  try {
    const mongoUser = await getAuthenticatedUser(req);
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      res.status(404);
      throw new Error("Reservation not found");
    }

    if (
      !reservation.recipientId.equals(mongoUser._id) &&
      mongoUser.role !== "ADMIN"
    ) {
      res.status(403);
      throw new Error("Forbidden - You can only cancel your own reservations");
    }

    if (
      ["COMPLETED", "CANCELLED", "EXPIRED"].includes(
        reservation.status.toUpperCase(),
      )
    ) {
      res.status(400);
      throw new Error(
        `Cannot cancel reservation that is already ${reservation.status}`,
      );
    }

    reservation.status = "CANCELLED";
    reservation.cancelledAt = new Date();
    await reservation.save();

    // Restore food inventory stock atomically
    const restoredFood = await Food.findOneAndUpdate(
      { _id: reservation.foodId },
      { $inc: { quantity: reservation.quantity } },
      { new: true },
    );

    if (restoredFood && restoredFood.quantity > 0) {
      if (restoredFood.status === "SOLD_OUT") {
        const isExpired =
          restoredFood.expiryTime &&
          new Date(restoredFood.expiryTime) <= new Date();
        restoredFood.status = isExpired ? "EXPIRED" : "AVAILABLE";
        await restoredFood.save();
      }
    }

    // Trigger automatic notification to business partner
    await createNotificationHelper({
      userId: reservation.businessId,
      type: "RESERVATION_CANCELLED",
      title: "Reservation Cancelled by Recipient",
      message: `Reservation (Claim code: ${reservation.claimCode}) was cancelled by the recipient.`,
      relatedId: reservation._id,
    });

    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getBusinessReservations,
  getReservationById,
  updateReservationStatus,
  cancelReservation,
};
