import api from './client';

export const reviewApi = {
  getProductReviews: (slug) => api.get(`/products/${encodeURIComponent(slug)}/reviews/`),
  createReview: (slug, data) => api.post(`/products/${encodeURIComponent(slug)}/reviews/`, data),
  moderateReview: (id, data) => api.patch(`/reviews/${id}/moderate/`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}/`),
};
