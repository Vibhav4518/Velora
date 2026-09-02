import api from './client';

export const couponApi = {
  validateCoupon: (code, subtotal) => api.post('/coupons/validate/', { code, subtotal }),
  getCoupons: () => api.get('/coupons/'),
  createCoupon: (data) => api.post('/coupons/', data),
  updateCoupon: (id, data) => api.patch(`/coupons/${id}/`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}/`),
};
