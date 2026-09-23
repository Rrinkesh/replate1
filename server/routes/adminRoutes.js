const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const {
  getAllBusinesses,
  getAllRecipients,
  verifyBusiness,
  verifyRecipient,
  rejectBusiness,
  rejectRecipient,
} = require("../controllers/adminController");

// All admin routes require authenticated Firebase user + ADMIN role in database
router.use(protect);
router.use(adminOnly);

router.get("/businesses", getAllBusinesses);
router.get("/recipients", getAllRecipients);
router.put("/businesses/:id/verify", verifyBusiness);
router.put("/recipients/:id/verify", verifyRecipient);
router.delete("/businesses/:id/reject", rejectBusiness);
router.delete("/recipients/:id/reject", rejectRecipient);

module.exports = router;
