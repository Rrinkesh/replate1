const Notification = require("../models/Notification");

/**
 * Helper to create a user notification asynchronously
 * @param {Object} params
 * @param {string|ObjectId} params.userId
 * @param {string} params.type
 * @param {string} params.title
 * @param {string} params.message
 * @param {string|ObjectId} [params.relatedId]
 */
const createNotificationHelper = async ({
  userId,
  type,
  title,
  message,
  relatedId = null,
}) => {
  try {
    if (!userId || !type || !title || !message) {
      console.warn(
        "createNotificationHelper skipped: Missing required parameters",
      );
      return null;
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error("Failed to create notification document:", error.message);
    return null;
  }
};

module.exports = {
  createNotificationHelper,
};
