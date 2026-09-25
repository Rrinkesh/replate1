const fs = require('fs');

let file = fs.readFileSync('server/models/BusinessProfile.js', 'utf8');
if (!file.includes('registrationNumber:')) {
  file = file.replace(
    'isVerified: {',
    'registrationNumber: { type: String, default: "" },\n    eventCardImage: { type: String, default: "" },\n    isVerified: {'
  );
  fs.writeFileSync('server/models/BusinessProfile.js', file);
}

let userCtrl = fs.readFileSync('server/controllers/user.controller.js', 'utf8');

userCtrl = userCtrl.replace(
  'const { name, role, phone, organizationName, location, profileImage, recipientType, businessType } = req.body;',
  'const { name, role, phone, organizationName, location, profileImage, recipientType, businessType, registrationNumber, eventCardImage } = req.body;'
);

userCtrl = userCtrl.replace(
  'existing.businessType = businessType;',
  'existing.businessType = businessType;\n        if (registrationNumber) existing.registrationNumber = registrationNumber;\n        if (eventCardImage) existing.eventCardImage = eventCardImage;'
);

userCtrl = userCtrl.replace(
  'businessType: user.businessType || "RESTAURANT",',
  'businessType: user.businessType || "RESTAURANT",\n          registrationNumber: registrationNumber || "",\n          eventCardImage: eventCardImage || "",'
);

fs.writeFileSync('server/controllers/user.controller.js', userCtrl);
