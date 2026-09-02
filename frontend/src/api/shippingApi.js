import api from './client';

export const shippingApi = {
  getAddresses: () => api.get('/shipping/addresses/'),
  createAddress: (data) => api.post('/shipping/addresses/', data),
  updateAddress: (id, data) => api.patch(`/shipping/addresses/${id}/`, data),
  deleteAddress: (id) => api.delete(`/shipping/addresses/${id}/`),
  setDefaultAddress: (id) => api.post(`/shipping/addresses/${id}/set-default/`),
};
