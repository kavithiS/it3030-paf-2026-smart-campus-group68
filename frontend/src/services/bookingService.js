import api from './api';

const bookingService = {
  getUserBookings: (userId) =>
    api.get('/bookings/user', { headers: { 'X-User-Id': userId } }),

  getAllBookings: (filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.resourceId) params.resourceId = filters.resourceId;
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    return api.get('/bookings', { params });
  },

  getBookingById: (id) => api.get(`/bookings/${id}`),

  createBooking: (data, userId) =>
    api.post('/bookings', data, { headers: { 'X-User-Id': userId } }),

  reviewBooking: (id, data, adminUserId) =>
    api.put(`/bookings/${id}/review`, data, { headers: { 'X-User-Id': adminUserId } }),

  cancelBooking: (id, userId) =>
    api.put(`/bookings/${id}/cancel`, {}, { headers: { 'X-User-Id': userId } }),
};

export default bookingService;
