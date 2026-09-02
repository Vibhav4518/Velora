import api from './client';

export const orderApi = {
  checkout: (data) => api.post('/orders/checkout/', data),
  getOrders: (params) => api.get('/orders/', { params }),
  getOrderByNumber: (orderNumber) => api.get(`/orders/${orderNumber}/`),
  cancelOrder: (orderNumber, reason) => api.post(`/orders/${orderNumber}/cancel/`, { reason }),
  getInvoice: (orderNumber) => api.get(`/invoices/order/${orderNumber}/`),
};
