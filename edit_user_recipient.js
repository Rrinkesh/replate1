const fs = require('fs');

let userCtrl = fs.readFileSync('server/controllers/user.controller.js', 'utf8');

userCtrl = userCtrl.replace(
  'const existing = await RecipientProfile.findOne({ userId: user._id });\n      if (!existing) {',
  'const existing = await RecipientProfile.findOne({ userId: user._id });\n      if (existing && registrationNumber && !existing.registrationNumber) {\n        existing.registrationNumber = registrationNumber;\n        await existing.save().catch(() => {});\n      }\n      if (!existing) {'
);

userCtrl = userCtrl.replace(
  'recipientType: user.recipientType || "NGO",',
  'recipientType: user.recipientType || "NGO",\n          registrationNumber: registrationNumber || "",'
);

fs.writeFileSync('server/controllers/user.controller.js', userCtrl);
