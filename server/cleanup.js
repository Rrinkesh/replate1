const mongoose = require('mongoose');
const User = require('./models/User');
const BusinessProfile = require('./models/BusinessProfile');
const RecipientProfile = require('./models/RecipientProfile');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    // Delete any users created in the last 2 hours
    const timeLimit = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const recentUsers = await User.find({ createdAt: { $gte: timeLimit } });
    
    for (const u of recentUsers) {
       console.log('Deleting corrupted user:', u.name, u.email);
       await BusinessProfile.deleteOne({ userId: u._id });
       await RecipientProfile.deleteOne({ userId: u._id });
       await User.deleteOne({ _id: u._id });
    }
    console.log('Cleanup complete.');
    process.exit(0);
  });
