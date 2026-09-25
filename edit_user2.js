const fs = require('fs');
let file = fs.readFileSync('server/controllers/user.controller.js', 'utf8');

file = file.replace(
  'const { name, role, phone, organizationName, location, profileImage, recipientType } = req.body;',
  'const { name, role, phone, organizationName, location, profileImage, recipientType, businessType } = req.body;'
);

file = file.replace(
  'recipientType: finalRole === \"RECIPIENT\" ? (recipientType || \"NGO\") : undefined,',
  'recipientType: finalRole === \"RECIPIENT\" ? (recipientType || \"NGO\") : undefined,\n        businessType: finalRole === \"BUSINESS\" ? (businessType || \"RESTAURANT\") : undefined,'
);

file = file.replace(
  'if (finalRole === \"RECIPIENT\" && recipientType && !user.recipientType) user.recipientType = recipientType;',
  'if (finalRole === \"RECIPIENT\" && recipientType && !user.recipientType) user.recipientType = recipientType;\n      if (finalRole === \"BUSINESS\" && businessType && !user.businessType) user.businessType = businessType;'
);

file = file.replace(
  'const existing = await BusinessProfile.findOne({ userId: user._id });',
  'const existing = await BusinessProfile.findOne({ userId: user._id });\n      if (existing && finalRole === \"BUSINESS\" && businessType && existing.businessType !== businessType) {\n        existing.businessType = businessType;\n        await existing.save().catch(() => {});\n      }'
);

file = file.replace(
  'businessName: user.organizationName || user.name || \"Business Partner\",',
  'businessName: user.organizationName || user.name || \"Business Partner\",\n          businessType: user.businessType || \"RESTAURANT\",'
);

fs.writeFileSync('server/controllers/user.controller.js', file);

