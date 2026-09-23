/**
 * Expiry Status Calculation Utility
 * Determines food listing status based on configured time thresholds
 */

const EXPIRY_THRESHOLDS = {
  ALMOST_EXPIRED_MS: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
  EXPIRING_SOON_MS: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
};

/**
 * Calculates current food listing status dynamically
 * @param {Date|string} expiryTime - The target expiry timestamp
 * @param {string} currentStatus - Existing status string
 * @returns {string} - Computed status ('AVAILABLE' | 'EXPIRING_SOON' | 'ALMOST_EXPIRED' | 'SOLD_OUT' | 'EXPIRED')
 */
const calculateExpiryStatus = (expiryTime, currentStatus) => {
  if (currentStatus === "SOLD_OUT") {
    return "SOLD_OUT";
  }

  if (!expiryTime) {
    return currentStatus || "AVAILABLE";
  }

  const now = new Date().getTime();
  const expiry = new Date(expiryTime).getTime();
  const diff = expiry - now;

  if (diff <= 0) {
    return "EXPIRED";
  }

  if (diff <= EXPIRY_THRESHOLDS.ALMOST_EXPIRED_MS) {
    return "ALMOST_EXPIRED";
  }

  if (diff <= EXPIRY_THRESHOLDS.EXPIRING_SOON_MS) {
    return "EXPIRING_SOON";
  }

  return "AVAILABLE";
};

module.exports = {
  calculateExpiryStatus,
  EXPIRY_THRESHOLDS,
};
