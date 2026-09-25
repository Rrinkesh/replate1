const fs = require('fs');
let file = fs.readFileSync('client/src/pages/business/BusinessDashboardPage.jsx', 'utf8');

file = file.replace(/\\s*<ImpactWidget \/>\\s*<div className='mt-6'>\\s*<RewardsPanel userRole='BUSINESS' credits={currentUser\\?\\.impactCredits \\|\\| 0} level={currentUser\\?\\.rewardLevel \\|\\| 'NEW'} \/>\\s*<\/div>/g, '');

const search = '<div className=\"space-y-8\">\n        {/* 1. WELCOME HEADER */}';
const replace = '<div className=\"space-y-8\">\n        <ImpactWidget />\n        <div className=\"-mt-2 mb-2\">\n          <RewardsPanel userRole=\"BUSINESS\" credits={currentUser?.impactCredits || 0} level={currentUser?.rewardLevel || \"NEW\"} />\n        </div>\n        {/* 1. WELCOME HEADER */}';
file = file.replace(search, replace);

fs.writeFileSync('client/src/pages/business/BusinessDashboardPage.jsx', file);
