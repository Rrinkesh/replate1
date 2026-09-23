import api from "./api";

export const reservationService = {
  // Reserve / Claim Surplus Food Listing (Recipient)
  createReservation: async (foodId, quantity = 1) => {
    const response = await api.post("/reservations", { foodId, quantity });
    return response.data;
  },

  // Fetch Current Recipient User's Claims & Reservations
  getMyReservations: async (params = {}) => {
    const response = await api.get("/reservations/my", { params });
    return response.data;
  },

  // Fetch Incoming Reservations for Authenticated Business Owner
  getBusinessReservations: async () => {
    const response = await api.get("/reservations/business");
    return response.data;
  },

  // Fetch Single Reservation Details by ID
  getReservationById: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  // Update Reservation Status (Business Owner / Admin)
  updateReservationStatus: async (id, status) => {
    const response = await api.put(`/reservations/${id}/status`, { status });
    return response.data;
  },

  // Cancel Reservation (Recipient Owner)
  cancelReservation: async (id) => {
    const response = await api.put(`/reservations/${id}/cancel`);
    return response.data;
  },
};

export default reservationService;
