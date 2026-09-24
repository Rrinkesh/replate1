const {
  updateExpiredAndExpiringFoodListings,
} = require("../services/foodStatusService");

const EXPIRY_JOB_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes

let jobTimer = null;

const startExpiryBackgroundJob = () => {
  console.log("[ExpiryJob] Initializing Food Status Expiry Background Job...");

  updateExpiredAndExpiringFoodListings();

  if (!jobTimer) {
    jobTimer = setInterval(() => {
      updateExpiredAndExpiringFoodListings();
    }, EXPIRY_JOB_INTERVAL_MS);
  }
};

const stopExpiryBackgroundJob = () => {
  if (jobTimer) {
    clearInterval(jobTimer);
    jobTimer = null;
    console.log("[ExpiryJob] Food Status Expiry Background Job stopped.");
  }
};

module.exports = {
  startExpiryBackgroundJob,
  stopExpiryBackgroundJob,
};
