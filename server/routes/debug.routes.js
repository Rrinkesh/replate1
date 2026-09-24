const express = require("express");
const router = express.Router();
router.get("/env", (req, res) => {
  res.json({
    hasSuperAdmin: !!process.env.SUPER_ADMIN_EMAIL,
    superAdminValue: process.env.SUPER_ADMIN_EMAIL || "missing",
    hasFirebaseKey: !!process.env.FIREBASE_PRIVATE_KEY
  });
});
module.exports = router;

