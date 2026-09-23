import api from "./api";

export const foodService = {
  // Fetch All Available Food Listings (with query filtering)
  getFoods: async (params = {}) => {
    const response = await api.get("/food", { params });
    return response.data;
  },

  // Fetch Business User's Own Food Listings (Management)
  getMyFoodListings: async (params = {}) => {
    const response = await api.get("/food/me/listings", { params });
    return response.data;
  },

  // Fetch Single Food Listing by ID
  getFoodById: async (id) => {
    const response = await api.get(`/food/${id}`);
    return response.data;
  },

  // Create New Surplus Food Listing (Business Auth Required)
  createFood: async (foodData) => {
    const response = await api.post("/food", foodData);
    return response.data;
  },

  // Update Owned Food Listing (Business Owner Required)
  updateFood: async (id, foodData) => {
    const response = await api.put(`/food/${id}`, foodData);
    return response.data;
  },

  // Delete Owned Food Listing (Business Owner Required)
  deleteFood: async (id) => {
    const response = await api.delete(`/food/${id}`);
    return response.data;
  },
};

export default foodService;
