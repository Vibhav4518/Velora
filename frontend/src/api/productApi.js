import api from './client';

export const productApi = {
  getProducts: (params) => api.get('/products/', { params }),
  getProductBySlug: (slug) => api.get(`/products/${encodeURIComponent(slug)}/`),
  getRelatedProducts: (slug) => api.get(`/products/${encodeURIComponent(slug)}/related/`),
  createProduct: (data) => api.post('/products/', data),
  updateProduct: (slug, data) => api.patch(`/products/${encodeURIComponent(slug)}/`, data),
  deleteProduct: (slug) => api.delete(`/products/${encodeURIComponent(slug)}/`),
};
