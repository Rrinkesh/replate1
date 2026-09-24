const Notification = require("../models/Notification");

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
