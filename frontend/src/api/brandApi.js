import api from './client';

export const brandApi = {
  getBrands: () => api.get('/brands/'),
  getBrandBySlug: (slug) => api.get(`/brands/${slug}/`),
  createBrand: (data) => api.post('/brands/', data),
  updateBrand: (slug, data) => api.patch(`/brands/${slug}/`, data),
  deleteBrand: (slug) => api.delete(`/brands/${slug}/`),
};
