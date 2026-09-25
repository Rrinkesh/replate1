const fs = require('fs');
let file = fs.readFileSync('client/src/pages/recipient/RecipientDashboardPage.jsx', 'utf8');
const search = '<div className=\"space-y-8\">';
const replace = '<div className=\"space-y-8\">\n        <ImpactWidget />\n        <RewardsPanel userRole=\"NGO\" credits={currentUser?.impactCredits || 0} level={currentUser?.rewardLevel || \"NEW\"} />';
file = file.replace(search, replace);
fs.writeFileSync('client/src/pages/recipient/RecipientDashboardPage.jsx', file);
