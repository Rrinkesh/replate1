import { useState, useEffect } from "react";

/**
 * Custom React hook for live food expiry countdown calculation
 * @param {Date|string|number} expiryTime Target expiry timestamp
 * @returns {Object} { timeRemainingText, diffMs, isExpired, isExpiringSoon, isAlmostExpired }
 */
export const useCountdown = (expiryTime) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!expiryTime) return;

    // Update interval: every 10 seconds for urgent items, otherwise every 30 seconds
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  if (!expiryTime) {
    return {
      timeRemainingText: "",
      diffMs: Infinity,
      isExpired: false,
      isExpiringSoon: false,
      isAlmostExpired: false,
    };
  }

  const expiry = new Date(expiryTime).getTime();
  const diffMs = expiry - now;

  const isExpired = diffMs <= 0;
  const isAlmostExpired = !isExpired && diffMs <= 1 * 60 * 60 * 1000; // <= 1 hour
  const isExpiringSoon = !isExpired && diffMs <= 3 * 60 * 60 * 1000; // <= 3 hours

  let timeRemainingText = "";
  if (isExpired) {
    timeRemainingText = "Expired";
  } else {
    const totalMinutes = Math.floor(diffMs / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      timeRemainingText = `${hours}h ${minutes}m left`;
    } else {
      timeRemainingText = `${minutes}m left`;
    }
  }

  return {
    timeRemainingText,
    diffMs,
    isExpired,
    isExpiringSoon,
    isAlmostExpired,
  };
};

export default useCountdown;
