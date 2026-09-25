const Food = require("../models/Food");
const User = require("../models/User");
const Notification = require("../models/Notification");

const ESCALATION_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes

const runEscalationSweep = async () => {
  try {
    // Find food that expires in <= 30 mins, has price > 0, and is still AVAILABLE
    const thresholdTime = new Date(Date.now() + 30 * 60 * 1000); // T + 30 mins
    
    const foodsToEscalate = await Food.find({
      status: "AVAILABLE",
      price: { $gt: 0 },
      expiryTime: { $lte: thresholdTime, $gt: new Date() } // Expiring within next 30 mins but not yet expired
    });

    if (foodsToEscalate.length === 0) return;

    console.log(`[Auto-Escalation] Escaling ${foodsToEscalate.length} food items to FREE for NGOs...`);

    // Find all NGOs to notify
    const ngos = await User.find({ role: "RECIPIENT", recipientType: "NGO" });

    for (const food of foodsToEscalate) {
      // Set to 0 and record original price
      if (food.originalPrice === undefined) {
          food.originalPrice = food.price;
      }
      food.price = 0;
      await food.save();

      // Create notifications for NGOs
      const notifications = ngos.map(ngo => ({
        userId: ngo._id,
        type: "FOOD_EXPIRING",
        title: "Urgent: Food Escalated to FREE!",
        message: `${food.name} expires in under 30 minutes and has been made completely free for NGOs. Claim it now!`,
        relatedId: food._id,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }
  } catch (error) {
    console.error("[Auto-Escalation] Error in escalation background job:", error);
  }
};

const startEscalationJob = () => {
  console.log("Starting Auto-Escalation Background Job (Running every 5 minutes)...");
  
  // Run immediately on boot
  runEscalationSweep();
  
  // Set to run continuously
  setInterval(runEscalationSweep, ESCALATION_INTERVAL_MS);
};

module.exports = startEscalationJob;

