const fs = require('fs');
let file = fs.readFileSync('client/src/pages/auth/SignupPage.jsx', 'utf8');

// For signup
file = file.replace(
  '...(role === "recipient" && { recipientType }),',
  '...(role === "recipient" && { recipientType, registrationNumber }),'
);

// For loginWithGoogle
file = file.replace(
  '...(role === "recipient" && { recipientType })',
  '...(role === "recipient" && { recipientType, registrationNumber })'
);

fs.writeFileSync('client/src/pages/auth/SignupPage.jsx', file);
