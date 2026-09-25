const fs = require('fs');

// 1. BusinessDashboardPage.jsx
let bizFile = fs.readFileSync('client/src/pages/business/BusinessDashboardPage.jsx', 'utf8');
bizFile = bizFile.replace(
  'const { currentUser } = useAuth();',
  'const { currentUser, mongoUser } = useAuth();'
);
bizFile = bizFile.replace(
  '{currentUser?.name || "Radisson Hotel Noida"}',
  '{mongoUser?.organizationName || currentUser?.name || "Verified Business Partner"}'
);
bizFile = bizFile.replace(
  'Sector 55, Noida • Commercial Food Surplus Partner',
  '{mongoUser?.location?.city || "Noida"} • Food Surplus Partner'
);
fs.writeFileSync('client/src/pages/business/BusinessDashboardPage.jsx', bizFile);

// 2. RecipientDashboardPage.jsx
let recFile = fs.readFileSync('client/src/pages/recipient/RecipientDashboardPage.jsx', 'utf8');
recFile = recFile.replace(
  'const { currentUser } = useAuth();',
  'const { currentUser, mongoUser } = useAuth();'
);
recFile = recFile.replace(
  '{currentUser?.name || "Verified NGO Partner"}',
  '{mongoUser?.organizationName || currentUser?.name || "Verified Recipient Partner"}'
);
recFile = recFile.replace(
  'Community Welfare Network • Noida Sector 62',
  'Verified Recipient • {mongoUser?.location?.city || "Noida"}'
);
fs.writeFileSync('client/src/pages/recipient/RecipientDashboardPage.jsx', recFile);

// 3. ProfilePage.jsx
let profFile = fs.readFileSync('client/src/pages/public/ProfilePage.jsx', 'utf8');
profFile = profFile.replace(
  '? "Radisson Executive Partner"',
  '? "Verified Business Partner"'
);
profFile = profFile.replace(
  ': "Grace Care Shelter"),',
  ': "Verified Recipient"),'
);
fs.writeFileSync('client/src/pages/public/ProfilePage.jsx', profFile);

// 4. FoodDirectoryPage.jsx
let foodFile = fs.readFileSync('client/src/pages/recipient/FoodDirectoryPage.jsx', 'utf8');
foodFile = foodFile.replace(
  'e.g. Paneer, Radisson, Sector 62',
  'e.g. Paneer, Hotel, Sector 62'
);
fs.writeFileSync('client/src/pages/recipient/FoodDirectoryPage.jsx', foodFile);

console.log("Replaced hardcoded Radisson strings with dynamic data.");
