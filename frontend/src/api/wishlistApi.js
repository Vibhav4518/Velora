import api from './client';

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist/'),
  addToWishlist: (productId) => api.post('/wishlist/', { product_id: productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/items/${productId}/`),
  moveToCart: (productId) => api.post(`/wishlist/items/${productId}/move-to-cart/`),
};
