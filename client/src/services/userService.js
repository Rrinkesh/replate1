import api from "./api";

export const userService = {
  // Sync Firebase User with MongoDB Profile
  syncUser: async (userData = {}) => {
    const response = await api.post("/users/sync", userData);
    return response.data;
  },

  // Get Current Authenticated MongoDB User Profile
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  // Get User Profile by Firebase UID
  getUserByUid: async (uid) => {
    const response = await api.get(`/users/${uid}`);
    return response.data;
  },
};

export default userService;
