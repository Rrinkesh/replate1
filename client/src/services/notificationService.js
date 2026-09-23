import api from "./api";

export const notificationService = {
  // Fetch user notifications & unread count
  getNotifications: async () => {
    const response = await api.get("/notifications");
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put("/notifications/read-all");
    return response.data;
  },

  // Delete single notification
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
