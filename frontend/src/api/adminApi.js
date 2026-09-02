import api from './client';

export const adminApi = {
  getDashboardStats: () => api.get('/dashboard/stats/'),
  getUsers: (params) => api.get('/users/', { params }),
  createUser: (data) => api.post('/users/', data),
  updateUser: (id, data) => api.patch(`/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/users/${id}/`),
  getRoles: () => api.get('/users/roles/'),
  createRole: (data) => api.post('/users/roles/', data),
  getPermissions: () => api.get('/users/permissions/'),
  updateOrderStatus: (orderNumber, data) => api.patch(`/orders/${orderNumber}/status/`, data),
  getAuditLogs: (params) => api.get('/audit/', { params }),
};
