import axios from 'axios';

export const getToken = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);

export const setToken = (key, value, remember = true) => {
  if (remember) {
    localStorage.setItem(key, value);
    sessionStorage.removeItem(key);
  } else {
    sessionStorage.setItem(key, value);
    localStorage.removeItem(key);
  }
};

export const clearTokens = () => {
  ['velora_access_token', 'velora_refresh_token', 'velora_user'].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
};

const getSessionKey = () => {
  let key = getToken('velora_session_key');
  if (!key) {
    key = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('velora_session_key', key);
  }
  return key;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? (import.meta.env.VITE_API_BASE_URL.endsWith('/api') 
      ? import.meta.env.VITE_API_BASE_URL 
      : `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken('velora_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Session-Key'] = getSessionKey();
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getToken('velora_refresh_token');
      const isPersistent = !!localStorage.getItem('velora_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh/', { refresh: refreshToken });
          if (res.data && res.data.access) {
            setToken('velora_access_token', res.data.access, isPersistent);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          clearTokens();
          window.dispatchEvent(new CustomEvent('velora_auth_logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
