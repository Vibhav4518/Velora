import api from './client';

export const cartApi = {
  getCart: () => api.get('/cart/'),
  addToCart: (productId, quantity = 1) => api.post('/cart/', { product_id: productId, quantity }),
  updateQuantity: (itemId, quantity) => api.patch(`/cart/items/${itemId}/`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}/`),
  clearCart: () => api.post('/cart/clear/'),
};
