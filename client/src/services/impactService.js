import api from "./api";

export const impactService = {
  getMyImpact: async () => {
    const response = await api.get("/impact/me");
    return response.data;
  },

  requestReward: async (type, details = {}) => {
    const response = await api.post("/impact/rewards/request", {
      type,
      details,
    });
    return response.data;
  },
};

export default impactService;
