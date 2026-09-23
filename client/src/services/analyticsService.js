import api from "./api";

export const analyticsService = {
  // Fetch commercial business analytics and daily trends
  getBusinessAnalytics: async (timeframe = "30d") => {
    const response = await api.get("/analytics/business", {
      params: { timeframe },
    });
    return response.data;
  },

  // Fetch recipient NGO analytics and impact metrics
  getRecipientAnalytics: async (timeframe = "30d") => {
    const response = await api.get("/analytics/recipient", {
      params: { timeframe },
    });
    return response.data;
  },

  // Fetch system-wide admin analytics and platform metrics
  getAdminAnalytics: async (timeframe = "30d") => {
    const response = await api.get("/analytics/admin", {
      params: { timeframe },
    });
    return response.data;
  },
};

export default analyticsService;
