import api from './client';

export const supportApi = {
  submitTicket: (data) => api.post('/support/tickets/', data),
  getMyTickets: () => api.get('/support/tickets/my/'),
  getAdminTickets: (status = '') => api.get(`/support/tickets/admin/${status ? `?status=${status}` : ''}`),
  updateAdminTicket: (id, data) => api.patch(`/support/tickets/admin/${id}/`, data),
};
