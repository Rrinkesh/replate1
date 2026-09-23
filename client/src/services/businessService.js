import api from "./api";

export const businessService = {
  // Fetch Authenticated Business Profile
  getMyBusinessProfile: async () => {
    const response = await api.get("/businesses/me");
    return response.data;
  },

  // Create Business Profile
  createBusinessProfile: async (profileData) => {
    const response = await api.post("/businesses/profile", profileData);
    return response.data;
  },

  // Update Business Profile
  updateBusinessProfile: async (profileData) => {
    const response = await api.put("/businesses/profile", profileData);
    return response.data;
  },
};

export default businessService;
