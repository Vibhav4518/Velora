import api from './client';

export const getNotifications = async () => {
  const response = await api.get('/notifications/');
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await api.post(`/notifications/${id}/read/`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await api.post('/notifications/read-all/');
  return response.data;
};

export const clearReadNotifications = async () => {
  const response = await api.post('/notifications/clear-read/');
  return response.data;
};
