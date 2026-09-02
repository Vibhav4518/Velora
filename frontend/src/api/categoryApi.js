import api from './client';

export const categoryApi = {
  getCategories: () => api.get('/categories/'),
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}/`),
  createCategory: (data) => api.post('/categories/', data),
  updateCategory: (slug, data) => api.patch(`/categories/${slug}/`, data),
  deleteCategory: (slug) => api.delete(`/categories/${slug}/`),
};
