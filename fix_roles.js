const mongoose = require('mongoose');
require('dotenv').config();
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/User');
    const BusinessProfile = require('./models/BusinessProfile');
    const RecipientProfile = require('./models/RecipientProfile');
    
    const users = await User.find({ email: { $ne: process.env.SUPER_ADMIN_EMAIL } });
    
    for (let u of users) {
      const isRecipient = await RecipientProfile.findOne({ userId: u._id });
      u.role = isRecipient ? 'RECIPIENT' : 'BUSINESS';
      u.isVerified = false; 
      await u.save();
    }
    console.log('Reset complete!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
