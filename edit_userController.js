const fs = require('fs');
let file = fs.readFileSync('server/controllers/user.controller.js', 'utf8');

file = file.replace(
  'const { name, role, phone, organizationName, location, profileImage } =\\n      req.body;',
  'const { name, role, phone, organizationName, location, profileImage, recipientType } = req.body;'
);

file = file.replace(
  'role: finalRole,',
  'role: finalRole,\n        recipientType: finalRole === \"RECIPIENT\" ? (recipientType || \"NGO\") : undefined,'
);

// If user exists and doesn't have a recipient type but role is RECIPIENT, update it
file = file.replace(
  '      if (isSuperAdmin) {',
  '      if (finalRole === \"RECIPIENT\" && recipientType && !user.recipientType) user.recipientType = recipientType;\n      if (isSuperAdmin) {'
);

fs.writeFileSync('server/controllers/user.controller.js', file);

