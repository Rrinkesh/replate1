import api from "./api";

export const recipientService = {
  // Fetch Authenticated Recipient Profile
  getMyRecipientProfile: async () => {
    const response = await api.get("/recipients/me");
    return response.data;
  },

  // Create Recipient Profile
  createRecipientProfile: async (profileData) => {
    const response = await api.post("/recipients/profile", profileData);
    return response.data;
  },

  // Update Recipient Profile
  updateRecipientProfile: async (profileData) => {
    const response = await api.put("/recipients/profile", profileData);
    return response.data;
  },
};

export default recipientService;
