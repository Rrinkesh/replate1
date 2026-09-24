const EXPIRY_THRESHOLDS = {
  ALMOST_EXPIRED_MS: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
  EXPIRING_SOON_MS: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
};

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
