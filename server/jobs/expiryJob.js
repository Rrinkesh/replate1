const {
  updateExpiredAndExpiringFoodListings,
} = require("../services/foodStatusService");

const EXPIRY_JOB_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes

let jobTimer = null;

/**
 * Initializes the background food status/expiry monitor job
 */
const startExpiryBackgroundJob = () => {
  console.log("[ExpiryJob] Initializing Food Status Expiry Background Job...");

  // 1. Run immediately on server initialization
  updateExpiredAndExpiringFoodListings();

  // 2. Schedule recurring execution every 5 minutes
  if (!jobTimer) {
    jobTimer = setInterval(() => {
      updateExpiredAndExpiringFoodListings();
    }, EXPIRY_JOB_INTERVAL_MS);
  }
};

/**
 * Stops the background expiry job cleanly if needed
 */
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
