import api from "./api";

export const aiService = {
  // Fetch AI Predictive Forecast (Phase 2 Preview)
  getSurplusForecast: async () => {
    const response = await api.get("/ai");
    return response.data;
  },
};

export default aiService;
