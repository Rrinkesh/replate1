const express = require("express");
const router = express.Router();

const { protect, verifiedOnly } = require("../middleware/authMiddleware");
const {
  createReservation,
  getMyReservations,
  getBusinessReservations,
  getReservationById,
  updateReservationStatus,
  cancelReservation,
} = require("../controllers/reservationController");

// All reservation endpoints require authenticated user
router.use(protect);

router.post("/", verifiedOnly, createReservation);
router.get("/my", getMyReservations);
router.get("/business", getBusinessReservations);
router.get("/:id", getReservationById);
router.put("/:id/status", verifiedOnly, updateReservationStatus);
router.put("/:id/cancel", verifiedOnly, cancelReservation);

module.exports = router;
