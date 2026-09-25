const fs = require('fs');

let file = fs.readFileSync('server/controllers/user.controller.js', 'utf8');

const searchBlock = `    if (!user) {
      // Auto-create basic profile if first time accessing /me
      user = await User.create({
        firebaseUid,
        email,
        name: req.user.name || "RePlate User",
        role: isSuperAdmin ? "ADMIN" : "BUSINESS",
        isVerified: isSuperAdmin ? true : false,
      });
    } else if (isSuperAdmin && (user.role !== "ADMIN" || !user.isVerified)) {`;

const replaceBlock = `    if (!user) {
      // Do NOT auto-create. Allow syncWithMongoDB to handle creation.
      // Returning null prevents the frontend from crashing/logging out during the signup race condition.
      return res.status(200).json({
        success: true,
        data: null,
      });
    } else if (isSuperAdmin && (user.role !== "ADMIN" || !user.isVerified)) {`;

file = file.replace(searchBlock, replaceBlock);

fs.writeFileSync('server/controllers/user.controller.js', file);
